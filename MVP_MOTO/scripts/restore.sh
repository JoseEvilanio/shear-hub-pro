#!/bin/bash
# Script de Restore de Backup
# Sistema de Gestão de Oficina Mecânica de Motos

set -e

# Configurações
BACKUP_DIR="/backups"
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-oficina_motos}"
DB_USER="${DB_USER:-postgres}"
S3_BUCKET="${S3_BUCKET:-oficina-motos-backups}"

# Função de log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Função para mostrar uso
show_usage() {
    echo "Uso: $0 [opções]"
    echo ""
    echo "Opções:"
    echo "  -f, --file FILE         Arquivo de backup local para restaurar"
    echo "  -s, --s3-path PATH      Caminho do backup no S3"
    echo "  -d, --date DATE         Data do backup (YYYY-MM-DD)"
    echo "  -l, --list              Listar backups disponíveis"
    echo "  --db-only               Restaurar apenas banco de dados"
    echo "  --files-only            Restaurar apenas arquivos"
    echo "  --force                 Forçar restore sem confirmação"
    echo "  -h, --help              Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 -f /backups/db_backup_20240125_143000.sql.gz"
    echo "  $0 -d 2024-01-25"
    echo "  $0 -s 2024/01/25/db_backup_20240125_143000.sql.gz"
    echo "  $0 -l"
}

# Função para listar backups
list_backups() {
    log "Backups locais disponíveis:"
    if ls "$BACKUP_DIR"/*.sql.gz >/dev/null 2>&1; then
        ls -la "$BACKUP_DIR"/*.sql.gz | awk '{print $9, $5, $6, $7, $8}'
    else
        log "Nenhum backup local encontrado"
    fi
    
    echo ""
    
    if command -v aws >/dev/null 2>&1; then
        log "Backups no S3:"
        aws s3 ls "s3://$S3_BUCKET/" --recursive | grep "\.sql\.gz$" | tail -10
    else
        log "AWS CLI não disponível para listar backups do S3"
    fi
}

# Função para baixar backup do S3
download_from_s3() {
    local s3_path="$1"
    local local_file="$BACKUP_DIR/$(basename "$s3_path")"
    
    log "Baixando backup do S3: $s3_path"
    
    aws s3 cp "s3://$S3_BUCKET/$s3_path" "$local_file" || {
        log "ERRO: Falha ao baixar backup do S3"
        return 1
    }
    
    echo "$local_file"
}

# Função para encontrar backup por data
find_backup_by_date() {
    local date="$1"
    local formatted_date=$(echo "$date" | tr -d '-')
    
    # Procurar localmente primeiro
    local local_backup=$(ls "$BACKUP_DIR"/db_backup_${formatted_date}_*.sql.gz 2>/dev/null | head -1)
    if [ -n "$local_backup" ]; then
        echo "$local_backup"
        return 0
    fi
    
    # Procurar no S3
    if command -v aws >/dev/null 2>&1; then
        local s3_backup=$(aws s3 ls "s3://$S3_BUCKET/${date//-/\/}/" | grep "db_backup_${formatted_date}" | head -1 | awk '{print $4}')
        if [ -n "$s3_backup" ]; then
            download_from_s3 "${date//-/\/}/$s3_backup"
            return 0
        fi
    fi
    
    log "ERRO: Backup não encontrado para a data $date"
    return 1
}

# Função para confirmar restore
confirm_restore() {
    local backup_file="$1"
    
    if [ "$FORCE" = "true" ]; then
        return 0
    fi
    
    echo ""
    log "ATENÇÃO: Esta operação irá substituir todos os dados atuais!"
    log "Backup a ser restaurado: $backup_file"
    log "Banco de dados: $DB_NAME"
    echo ""
    read -p "Tem certeza que deseja continuar? (digite 'CONFIRMO' para prosseguir): " confirmation
    
    if [ "$confirmation" != "CONFIRMO" ]; then
        log "Operação cancelada pelo usuário"
        exit 1
    fi
}

# Função para criar backup antes do restore
create_pre_restore_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/pre_restore_backup_$timestamp.sql"
    
    log "Criando backup de segurança antes do restore..."
    
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --no-password --verbose --clean --if-exists \
        --format=custom --compress=9 \
        --file="$backup_file" || {
        log "AVISO: Falha ao criar backup de segurança"
        return 1
    }
    
    gzip "$backup_file"
    log "Backup de segurança criado: $backup_file.gz"
}

# Função para restaurar banco de dados
restore_database() {
    local backup_file="$1"
    
    log "Iniciando restore do banco de dados..."
    log "Arquivo: $backup_file"
    
    # Verificar se arquivo existe
    if [ ! -f "$backup_file" ]; then
        log "ERRO: Arquivo de backup não encontrado: $backup_file"
        return 1
    fi
    
    # Descomprimir se necessário
    local sql_file="$backup_file"
    if [[ "$backup_file" == *.gz ]]; then
        sql_file="${backup_file%.gz}"
        log "Descomprimindo backup..."
        gunzip -c "$backup_file" > "$sql_file" || {
            log "ERRO: Falha ao descomprimir backup"
            return 1
        }
    fi
    
    # Restaurar banco
    log "Restaurando banco de dados..."
    pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --no-password --verbose --clean --if-exists \
        "$sql_file" || {
        log "ERRO: Falha ao restaurar banco de dados"
        return 1
    }
    
    # Limpar arquivo temporário se foi descomprimido
    if [[ "$backup_file" == *.gz ]]; then
        rm -f "$sql_file"
    fi
    
    log "Restore do banco de dados concluído com sucesso"
}

# Função para restaurar arquivos
restore_files() {
    local backup_file="$1"
    
    log "Iniciando restore de arquivos..."
    log "Arquivo: $backup_file"
    
    # Verificar se arquivo existe
    if [ ! -f "$backup_file" ]; then
        log "ERRO: Arquivo de backup não encontrado: $backup_file"
        return 1
    fi
    
    # Criar backup dos arquivos atuais
    if [ -d "/app/uploads" ] || [ -d "/app/logs" ]; then
        local timestamp=$(date +%Y%m%d_%H%M%S)
        local current_backup="/tmp/current_files_$timestamp.tar.gz"
        
        log "Criando backup dos arquivos atuais..."
        tar -czf "$current_backup" -C /app uploads/ logs/ 2>/dev/null || true
        log "Backup atual salvo em: $current_backup"
    fi
    
    # Restaurar arquivos
    log "Restaurando arquivos..."
    tar -xzf "$backup_file" -C /app || {
        log "ERRO: Falha ao restaurar arquivos"
        return 1
    }
    
    log "Restore de arquivos concluído com sucesso"
}

# Função para verificar integridade do banco após restore
verify_database() {
    log "Verificando integridade do banco de dados..."
    
    # Verificar conexão
    pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" || {
        log "ERRO: Banco de dados não está respondendo"
        return 1
    }
    
    # Verificar algumas tabelas principais
    local tables=("users" "clients" "products" "service_orders" "sales")
    for table in "${tables[@]}"; do
        local count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
            -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ')
        
        if [[ "$count" =~ ^[0-9]+$ ]]; then
            log "Tabela $table: $count registros"
        else
            log "AVISO: Problema ao verificar tabela $table"
        fi
    done
    
    log "Verificação de integridade concluída"
}

# Função principal
main() {
    local backup_file=""
    local s3_path=""
    local date=""
    local list_only=false
    local db_only=false
    local files_only=false
    
    # Parse dos argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--file)
                backup_file="$2"
                shift 2
                ;;
            -s|--s3-path)
                s3_path="$2"
                shift 2
                ;;
            -d|--date)
                date="$2"
                shift 2
                ;;
            -l|--list)
                list_only=true
                shift
                ;;
            --db-only)
                db_only=true
                shift
                ;;
            --files-only)
                files_only=true
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                log "ERRO: Opção desconhecida: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Listar backups se solicitado
    if [ "$list_only" = true ]; then
        list_backups
        exit 0
    fi
    
    # Determinar arquivo de backup
    if [ -n "$s3_path" ]; then
        backup_file=$(download_from_s3 "$s3_path")
    elif [ -n "$date" ]; then
        backup_file=$(find_backup_by_date "$date")
    elif [ -z "$backup_file" ]; then
        log "ERRO: Nenhum arquivo de backup especificado"
        show_usage
        exit 1
    fi
    
    # Verificar se arquivo existe
    if [ ! -f "$backup_file" ]; then
        log "ERRO: Arquivo de backup não encontrado: $backup_file"
        exit 1
    fi
    
    log "=== Iniciando processo de restore ==="
    log "Arquivo de backup: $backup_file"
    
    # Confirmar operação
    confirm_restore "$backup_file"
    
    # Criar backup de segurança
    create_pre_restore_backup || true
    
    # Executar restore
    local success=true
    
    if [ "$files_only" != true ]; then
        restore_database "$backup_file" || success=false
    fi
    
    if [ "$db_only" != true ] && [[ "$backup_file" == *files_backup* ]]; then
        restore_files "$backup_file" || success=false
    fi
    
    # Verificar integridade
    if [ "$files_only" != true ] && [ "$success" = true ]; then
        verify_database || true
    fi
    
    # Resultado final
    if [ "$success" = true ]; then
        log "=== Restore concluído com sucesso ==="
    else
        log "=== Restore concluído com erros ==="
        exit 1
    fi
}

# Executar função principal
main "$@"
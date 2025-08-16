#!/bin/bash
# Script de Backup Automático
# Sistema de Gestão de Oficina Mecânica de Motos

set -e

# Configurações
BACKUP_DIR="/backups"
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-oficina_motos}"
DB_USER="${DB_USER:-postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
S3_BUCKET="${S3_BUCKET:-oficina-motos-backups}"

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Função de log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Função para criar backup do banco de dados
backup_database() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/db_backup_$timestamp.sql"
    local compressed_file="$backup_file.gz"
    
    log "Iniciando backup do banco de dados..."
    
    # Criar backup
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --no-password --verbose --clean --if-exists \
        --format=custom --compress=9 \
        --file="$backup_file" || {
        log "ERRO: Falha ao criar backup do banco de dados"
        return 1
    }
    
    # Comprimir backup
    gzip "$backup_file" || {
        log "ERRO: Falha ao comprimir backup"
        return 1
    }
    
    log "Backup criado: $compressed_file"
    echo "$compressed_file"
}

# Função para backup de arquivos
backup_files() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/files_backup_$timestamp.tar.gz"
    
    log "Iniciando backup de arquivos..."
    
    # Criar backup dos uploads e logs
    tar -czf "$backup_file" \
        -C /app \
        uploads/ logs/ || {
        log "ERRO: Falha ao criar backup de arquivos"
        return 1
    }
    
    log "Backup de arquivos criado: $backup_file"
    echo "$backup_file"
}

# Função para upload para S3
upload_to_s3() {
    local file="$1"
    local s3_path="s3://$S3_BUCKET/$(date +%Y/%m/%d)/$(basename "$file")"
    
    if command -v aws >/dev/null 2>&1; then
        log "Enviando backup para S3: $s3_path"
        aws s3 cp "$file" "$s3_path" || {
            log "ERRO: Falha ao enviar backup para S3"
            return 1
        }
        log "Backup enviado para S3 com sucesso"
    else
        log "AWS CLI não encontrado, pulando upload para S3"
    fi
}

# Função para limpeza de backups antigos
cleanup_old_backups() {
    log "Limpando backups antigos (mais de $RETENTION_DAYS dias)..."
    
    find "$BACKUP_DIR" -name "*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    log "Limpeza concluída"
}

# Função para verificar espaço em disco
check_disk_space() {
    local available=$(df "$BACKUP_DIR" | awk 'NR==2 {print $4}')
    local required=1048576  # 1GB em KB
    
    if [ "$available" -lt "$required" ]; then
        log "AVISO: Pouco espaço em disco disponível ($available KB)"
        return 1
    fi
    
    return 0
}

# Função para testar conectividade do banco
test_db_connection() {
    log "Testando conexão com o banco de dados..."
    
    pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" || {
        log "ERRO: Não foi possível conectar ao banco de dados"
        return 1
    }
    
    log "Conexão com banco de dados OK"
    return 0
}

# Função para enviar notificação
send_notification() {
    local status="$1"
    local message="$2"
    
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🔄 Backup Status: $status\\n$message\"}" \
            "$SLACK_WEBHOOK" || true
    fi
    
    if [ -n "$EMAIL_NOTIFICATION" ]; then
        echo "$message" | mail -s "Backup Status: $status" "$EMAIL_NOTIFICATION" || true
    fi
}

# Função principal
main() {
    log "=== Iniciando processo de backup ==="
    
    # Verificar pré-requisitos
    if ! check_disk_space; then
        send_notification "ERRO" "Espaço em disco insuficiente para backup"
        exit 1
    fi
    
    if ! test_db_connection; then
        send_notification "ERRO" "Falha na conexão com banco de dados"
        exit 1
    fi
    
    # Criar backups
    local db_backup_file
    local files_backup_file
    local success=true
    
    # Backup do banco de dados
    if db_backup_file=$(backup_database); then
        upload_to_s3 "$db_backup_file" || true
    else
        success=false
    fi
    
    # Backup de arquivos
    if files_backup_file=$(backup_files); then
        upload_to_s3 "$files_backup_file" || true
    else
        success=false
    fi
    
    # Limpeza
    cleanup_old_backups
    
    # Notificação final
    if [ "$success" = true ]; then
        local message="Backup concluído com sucesso\\n"
        message+="- Banco: $(basename "$db_backup_file")\\n"
        message+="- Arquivos: $(basename "$files_backup_file")"
        send_notification "SUCESSO" "$message"
        log "=== Backup concluído com sucesso ==="
    else
        send_notification "ERRO" "Falhas durante o processo de backup"
        log "=== Backup concluído com erros ==="
        exit 1
    fi
}

# Executar função principal
main "$@"
// Serviço de Relatórios
// Sistema de Gestão de Oficina Mecânica de Motos

const { query } = require('../../database/connection');

class ReportsService {
    // Relatório de aniversariantes
    async getBirthdayReport(month = null, year = null) {
        try {
            let queryText = `
                SELECT 
                    c.id,
                    c.name,
                    c.phone,
                    c.email,
                    c.birth_date,
                    EXTRACT(DAY FROM c.birth_date) as day,
                    EXTRACT(MONTH FROM c.birth_date) as month,
                    EXTRACT(YEAR FROM c.birth_date) as birth_year,
                    DATE_PART('year', AGE(c.birth_date)) as age,
                    COUNT(so.id) as total_service_orders,
                    COALESCE(SUM(so.total_amount), 0) as total_spent
                FROM clients c
                LEFT JOIN service_orders so ON c.id = so.client_id
                WHERE c.active = true 
                AND c.birth_date IS NOT NULL
            `;
            
            const params = [];
            let paramCount = 0;

            if (month) {
                paramCount++;
                queryText += ` AND EXTRACT(MONTH FROM c.birth_date) = $${paramCount}`;
                params.push(month);
            }

            if (year) {
                paramCount++;
                queryText += ` AND EXTRACT(YEAR FROM c.birth_date) = $${paramCount}`;
                params.push(year);
            }

            queryText += `
                GROUP BY c.id, c.name, c.phone, c.email, c.birth_date
                ORDER BY EXTRACT(MONTH FROM c.birth_date), EXTRACT(DAY FROM c.birth_date), c.name
            `;

            const result = await query(queryText, params);

            // Agrupar por mês
            const groupedByMonth = {};
            result.rows.forEach(client => {
                const monthKey = client.month;
                if (!groupedByMonth[monthKey]) {
                    groupedByMonth[monthKey] = {
                        month: monthKey,
                        monthName: this.getMonthName(monthKey),
                        clients: [],
                        totalClients: 0
                    };
                }
                groupedByMonth[monthKey].clients.push({
                    id: client.id,
                    name: client.name,
                    phone: client.phone,
                    email: client.email,
                    birthDate: client.birth_date,
                    day: client.day,
                    age: client.age,
                    totalServiceOrders: parseInt(client.total_service_orders),
                    totalSpent: parseFloat(client.total_spent)
                });
                groupedByMonth[monthKey].totalClients++;
            });

            return {
                summary: {
                    totalClients: result.rows.length,
                    month: month ? this.getMonthName(month) : 'Todos os meses',
                    year: year || 'Todos os anos'
                },
                data: Object.values(groupedByMonth)
            };

        } catch (error) {
            throw new Error(`Erro ao gerar relatório de aniversariantes: ${error.message}`);
        }
    }

    // Relatório de serviços por período
    async getServicesReport(startDate, endDate, mechanicId = null, status = null) {
        try {
            let queryText = `
                SELECT 
                    so.id,
                    so.number,
                    so.status,
                    so.created_at,
                    so.started_at,
                    so.completed_at,
                    so.delivered_at,
                    so.total_amount,
                    so.labor_amount,
                    so.parts_amount,
                    c.name as client_name,
                    c.phone as client_phone,
                    v.plate as vehicle_plate,
                    v.brand as vehicle_brand,
                    v.model as vehicle_model,
                    m.name as mechanic_name,
                    u.name as created_by,
                    CASE 
                        WHEN so.completed_at IS NOT NULL THEN 
                            EXTRACT(EPOCH FROM (so.completed_at - so.started_at))/3600
                        ELSE NULL
                    END as hours_worked
                FROM service_orders so
                JOIN clients c ON so.client_id = c.id
                JOIN vehicles v ON so.vehicle_id = v.id
                LEFT JOIN mechanics m ON so.mechanic_id = m.id
                LEFT JOIN users u ON so.user_id = u.id
                WHERE so.created_at BETWEEN $1 AND $2
            `;

            const params = [startDate, endDate];
            let paramCount = 2;

            if (mechanicId) {
                paramCount++;
                queryText += ` AND so.mechanic_id = $${paramCount}`;
                params.push(mechanicId);
            }

            if (status) {
                paramCount++;
                queryText += ` AND so.status = $${paramCount}`;
                params.push(status);
            }

            queryText += ` ORDER BY so.created_at DESC`;

            const result = await query(queryText, params);

            // Estatísticas
            const stats = {
                totalServices: result.rows.length,
                totalAmount: result.rows.reduce((sum, row) => sum + parseFloat(row.total_amount || 0), 0),
                totalLaborAmount: result.rows.reduce((sum, row) => sum + parseFloat(row.labor_amount || 0), 0),
                totalPartsAmount: result.rows.reduce((sum, row) => sum + parseFloat(row.parts_amount || 0), 0),
                averageAmount: 0,
                averageHours: 0,
                statusBreakdown: {},
                mechanicBreakdown: {}
            };

            if (stats.totalServices > 0) {
                stats.averageAmount = stats.totalAmount / stats.totalServices;
                
                const completedServices = result.rows.filter(row => row.hours_worked !== null);
                if (completedServices.length > 0) {
                    stats.averageHours = completedServices.reduce((sum, row) => sum + parseFloat(row.hours_worked || 0), 0) / completedServices.length;
                }
            }

            // Breakdown por status
            result.rows.forEach(row => {
                const status = row.status;
                if (!stats.statusBreakdown[status]) {
                    stats.statusBreakdown[status] = { count: 0, amount: 0 };
                }
                stats.statusBreakdown[status].count++;
                stats.statusBreakdown[status].amount += parseFloat(row.total_amount || 0);
            });

            // Breakdown por mecânico
            result.rows.forEach(row => {
                const mechanic = row.mechanic_name || 'Não atribuído';
                if (!stats.mechanicBreakdown[mechanic]) {
                    stats.mechanicBreakdown[mechanic] = { count: 0, amount: 0 };
                }
                stats.mechanicBreakdown[mechanic].count++;
                stats.mechanicBreakdown[mechanic].amount += parseFloat(row.total_amount || 0);
            });

            return {
                summary: {
                    period: { startDate, endDate },
                    mechanic: mechanicId ? result.rows[0]?.mechanic_name : 'Todos',
                    status: status || 'Todos',
                    ...stats
                },
                data: result.rows.map(row => ({
                    id: row.id,
                    number: row.number,
                    status: row.status,
                    createdAt: row.created_at,
                    startedAt: row.started_at,
                    completedAt: row.completed_at,
                    deliveredAt: row.delivered_at,
                    totalAmount: parseFloat(row.total_amount || 0),
                    laborAmount: parseFloat(row.labor_amount || 0),
                    partsAmount: parseFloat(row.parts_amount || 0),
                    hoursWorked: row.hours_worked ? parseFloat(row.hours_worked) : null,
                    client: {
                        name: row.client_name,
                        phone: row.client_phone
                    },
                    vehicle: {
                        plate: row.vehicle_plate,
                        brand: row.vehicle_brand,
                        model: row.vehicle_model
                    },
                    mechanic: row.mechanic_name,
                    createdBy: row.created_by
                }))
            };

        } catch (error) {
            throw new Error(`Erro ao gerar relatório de serviços: ${error.message}`);
        }
    }

    // Relatório de vendas detalhado
    async getSalesReport(startDate, endDate, clientId = null, userId = null, type = null, status = null) {
        try {
            let queryText = `
                SELECT 
                    s.id,
                    s.number,
                    s.type,
                    s.status,
                    s.sale_date,
                    s.subtotal,
                    s.discount_amount,
                    s.total_amount,
                    s.payment_method,
                    s.installments,
                    s.paid,
                    s.paid_amount,
                    c.name as client_name,
                    c.phone as client_phone,
                    c.email as client_email,
                    u.name as seller_name,
                    COUNT(si.id) as total_items,
                    COALESCE(SUM(si.quantity), 0) as total_quantity
                FROM sales s
                LEFT JOIN clients c ON s.client_id = c.id
                LEFT JOIN users u ON s.user_id = u.id
                LEFT JOIN sale_items si ON s.id = si.sale_id
                WHERE s.sale_date BETWEEN $1 AND $2
            `;

            const params = [startDate, endDate];
            let paramCount = 2;

            if (clientId) {
                paramCount++;
                queryText += ` AND s.client_id = $${paramCount}`;
                params.push(clientId);
            }

            if (userId) {
                paramCount++;
                queryText += ` AND s.user_id = $${paramCount}`;
                params.push(userId);
            }

            if (type) {
                paramCount++;
                queryText += ` AND s.type = $${paramCount}`;
                params.push(type);
            }

            if (status) {
                paramCount++;
                queryText += ` AND s.status = $${paramCount}`;
                params.push(status);
            }

            queryText += `
                GROUP BY s.id, s.number, s.type, s.status, s.sale_date, s.subtotal, 
                         s.discount_amount, s.total_amount, s.payment_method, s.installments,
                         s.paid, s.paid_amount, c.name, c.phone, c.email, u.name
                ORDER BY s.sale_date DESC
            `;

            const result = await query(queryText, params);

            // Estatísticas
            const stats = {
                totalSales: result.rows.length,
                totalAmount: result.rows.reduce((sum, row) => sum + parseFloat(row.total_amount || 0), 0),
                totalSubtotal: result.rows.reduce((sum, row) => sum + parseFloat(row.subtotal || 0), 0),
                totalDiscount: result.rows.reduce((sum, row) => sum + parseFloat(row.discount_amount || 0), 0),
                totalPaid: result.rows.reduce((sum, row) => sum + parseFloat(row.paid_amount || 0), 0),
                totalPending: 0,
                averageTicket: 0,
                typeBreakdown: {},
                statusBreakdown: {},
                paymentMethodBreakdown: {},
                sellerBreakdown: {}
            };

            stats.totalPending = stats.totalAmount - stats.totalPaid;
            if (stats.totalSales > 0) {
                stats.averageTicket = stats.totalAmount / stats.totalSales;
            }

            // Breakdowns
            result.rows.forEach(row => {
                // Por tipo
                const type = row.type;
                if (!stats.typeBreakdown[type]) {
                    stats.typeBreakdown[type] = { count: 0, amount: 0 };
                }
                stats.typeBreakdown[type].count++;
                stats.typeBreakdown[type].amount += parseFloat(row.total_amount || 0);

                // Por status
                const status = row.status;
                if (!stats.statusBreakdown[status]) {
                    stats.statusBreakdown[status] = { count: 0, amount: 0 };
                }
                stats.statusBreakdown[status].count++;
                stats.statusBreakdown[status].amount += parseFloat(row.total_amount || 0);

                // Por método de pagamento
                const paymentMethod = row.payment_method || 'Não informado';
                if (!stats.paymentMethodBreakdown[paymentMethod]) {
                    stats.paymentMethodBreakdown[paymentMethod] = { count: 0, amount: 0 };
                }
                stats.paymentMethodBreakdown[paymentMethod].count++;
                stats.paymentMethodBreakdown[paymentMethod].amount += parseFloat(row.total_amount || 0);

                // Por vendedor
                const seller = row.seller_name || 'Não informado';
                if (!stats.sellerBreakdown[seller]) {
                    stats.sellerBreakdown[seller] = { count: 0, amount: 0 };
                }
                stats.sellerBreakdown[seller].count++;
                stats.sellerBreakdown[seller].amount += parseFloat(row.total_amount || 0);
            });

            return {
                summary: {
                    period: { startDate, endDate },
                    client: clientId ? result.rows[0]?.client_name : 'Todos',
                    seller: userId ? result.rows[0]?.seller_name : 'Todos',
                    type: type || 'Todos',
                    status: status || 'Todos',
                    ...stats
                },
                data: result.rows.map(row => ({
                    id: row.id,
                    number: row.number,
                    type: row.type,
                    status: row.status,
                    saleDate: row.sale_date,
                    subtotal: parseFloat(row.subtotal || 0),
                    discountAmount: parseFloat(row.discount_amount || 0),
                    totalAmount: parseFloat(row.total_amount || 0),
                    paymentMethod: row.payment_method,
                    installments: parseInt(row.installments || 1),
                    paid: row.paid,
                    paidAmount: parseFloat(row.paid_amount || 0),
                    pendingAmount: parseFloat(row.total_amount || 0) - parseFloat(row.paid_amount || 0),
                    totalItems: parseInt(row.total_items || 0),
                    totalQuantity: parseInt(row.total_quantity || 0),
                    client: row.client_name ? {
                        name: row.client_name,
                        phone: row.client_phone,
                        email: row.client_email
                    } : null,
                    seller: row.seller_name
                }))
            };

        } catch (error) {
            throw new Error(`Erro ao gerar relatório de vendas: ${error.message}`);
        }
    }

    // Relatório de estoque atual e movimentações
    async getInventoryReport(productId = null, category = null, lowStock = false) {
        try {
            let queryText = `
                SELECT 
                    p.id,
                    p.code,
                    p.barcode,
                    p.name,
                    p.category,
                    p.brand,
                    p.type,
                    p.price,
                    p.cost,
                    p.stock_quantity,
                    p.min_stock,
                    p.max_stock,
                    p.unit,
                    p.image_url,
                    p.active,
                    CASE 
                        WHEN p.stock_quantity <= p.min_stock THEN 'low'
                        WHEN p.stock_quantity >= p.max_stock THEN 'high'
                        ELSE 'normal'
                    END as stock_status,
                    COALESCE(SUM(CASE WHEN im.type = 'in' THEN im.quantity ELSE 0 END), 0) as total_in,
                    COALESCE(SUM(CASE WHEN im.type = 'out' THEN ABS(im.quantity) ELSE 0 END), 0) as total_out,
                    COALESCE(SUM(CASE WHEN im.type = 'adjustment' THEN im.quantity ELSE 0 END), 0) as total_adjustments,
                    COUNT(im.id) as total_movements,
                    MAX(im.created_at) as last_movement_date,
                    p.stock_quantity * p.cost as inventory_value
                FROM products p
                LEFT JOIN inventory_movements im ON p.id = im.product_id
                WHERE p.active = true
            `;

            const params = [];
            let paramCount = 0;

            if (productId) {
                paramCount++;
                queryText += ` AND p.id = $${paramCount}`;
                params.push(productId);
            }

            if (category) {
                paramCount++;
                queryText += ` AND p.category = $${paramCount}`;
                params.push(category);
            }

            if (lowStock) {
                queryText += ` AND p.stock_quantity <= p.min_stock`;
            }

            queryText += `
                GROUP BY p.id, p.code, p.barcode, p.name, p.category, p.brand, p.type,
                         p.price, p.cost, p.stock_quantity, p.min_stock, p.max_stock,
                         p.unit, p.image_url, p.active
                ORDER BY p.name
            `;

            const result = await query(queryText, params);

            // Estatísticas gerais
            const stats = {
                totalProducts: result.rows.length,
                totalInventoryValue: result.rows.reduce((sum, row) => sum + parseFloat(row.inventory_value || 0), 0),
                lowStockProducts: result.rows.filter(row => row.stock_status === 'low').length,
                outOfStockProducts: result.rows.filter(row => row.stock_quantity === 0).length,
                categoryBreakdown: {},
                stockStatusBreakdown: {
                    low: 0,
                    normal: 0,
                    high: 0
                }
            };

            // Breakdown por categoria
            result.rows.forEach(row => {
                const category = row.category || 'Sem categoria';
                if (!stats.categoryBreakdown[category]) {
                    stats.categoryBreakdown[category] = {
                        count: 0,
                        totalValue: 0,
                        totalQuantity: 0
                    };
                }
                stats.categoryBreakdown[category].count++;
                stats.categoryBreakdown[category].totalValue += parseFloat(row.inventory_value || 0);
                stats.categoryBreakdown[category].totalQuantity += parseInt(row.stock_quantity || 0);

                // Status do estoque
                stats.stockStatusBreakdown[row.stock_status]++;
            });

            return {
                summary: {
                    filters: {
                        productId: productId || 'Todos',
                        category: category || 'Todas',
                        lowStock: lowStock
                    },
                    ...stats
                },
                data: result.rows.map(row => ({
                    id: row.id,
                    code: row.code,
                    barcode: row.barcode,
                    name: row.name,
                    category: row.category,
                    brand: row.brand,
                    type: row.type,
                    price: parseFloat(row.price || 0),
                    cost: parseFloat(row.cost || 0),
                    stockQuantity: parseInt(row.stock_quantity || 0),
                    minStock: parseInt(row.min_stock || 0),
                    maxStock: parseInt(row.max_stock || 0),
                    unit: row.unit,
                    imageUrl: row.image_url,
                    stockStatus: row.stock_status,
                    inventoryValue: parseFloat(row.inventory_value || 0),
                    movements: {
                        totalIn: parseInt(row.total_in || 0),
                        totalOut: parseInt(row.total_out || 0),
                        totalAdjustments: parseInt(row.total_adjustments || 0),
                        totalMovements: parseInt(row.total_movements || 0),
                        lastMovementDate: row.last_movement_date
                    }
                }))
            };

        } catch (error) {
            throw new Error(`Erro ao gerar relatório de estoque: ${error.message}`);
        }
    }

    // Relatório de movimentações de estoque por período
    async getInventoryMovementsReport(startDate, endDate, productId = null, type = null) {
        try {
            let queryText = `
                SELECT 
                    im.id,
                    im.type,
                    im.quantity,
                    im.unit_cost,
                    im.total_cost,
                    im.reference_type,
                    im.reference_number,
                    im.description,
                    im.created_at,
                    p.code as product_code,
                    p.name as product_name,
                    p.category as product_category,
                    p.unit as product_unit,
                    u.name as user_name
                FROM inventory_movements im
                JOIN products p ON im.product_id = p.id
                LEFT JOIN users u ON im.user_id = u.id
                WHERE im.created_at BETWEEN $1 AND $2
            `;

            const params = [startDate, endDate];
            let paramCount = 2;

            if (productId) {
                paramCount++;
                queryText += ` AND im.product_id = $${paramCount}`;
                params.push(productId);
            }

            if (type) {
                paramCount++;
                queryText += ` AND im.type = $${paramCount}`;
                params.push(type);
            }

            queryText += ` ORDER BY im.created_at DESC`;

            const result = await query(queryText, params);

            // Estatísticas
            const stats = {
                totalMovements: result.rows.length,
                totalIn: result.rows.filter(row => row.type === 'in').reduce((sum, row) => sum + parseInt(row.quantity || 0), 0),
                totalOut: result.rows.filter(row => row.type === 'out').reduce((sum, row) => sum + Math.abs(parseInt(row.quantity || 0)), 0),
                totalAdjustments: result.rows.filter(row => row.type === 'adjustment').length,
                totalCost: result.rows.reduce((sum, row) => sum + parseFloat(row.total_cost || 0), 0),
                typeBreakdown: {},
                productBreakdown: {},
                referenceBreakdown: {}
            };

            // Breakdowns
            result.rows.forEach(row => {
                // Por tipo
                const type = row.type;
                if (!stats.typeBreakdown[type]) {
                    stats.typeBreakdown[type] = { count: 0, quantity: 0, cost: 0 };
                }
                stats.typeBreakdown[type].count++;
                stats.typeBreakdown[type].quantity += Math.abs(parseInt(row.quantity || 0));
                stats.typeBreakdown[type].cost += parseFloat(row.total_cost || 0);

                // Por produto
                const product = row.product_name;
                if (!stats.productBreakdown[product]) {
                    stats.productBreakdown[product] = { count: 0, quantity: 0, cost: 0 };
                }
                stats.productBreakdown[product].count++;
                stats.productBreakdown[product].quantity += Math.abs(parseInt(row.quantity || 0));
                stats.productBreakdown[product].cost += parseFloat(row.total_cost || 0);

                // Por referência
                const reference = row.reference_type || 'Manual';
                if (!stats.referenceBreakdown[reference]) {
                    stats.referenceBreakdown[reference] = { count: 0, quantity: 0, cost: 0 };
                }
                stats.referenceBreakdown[reference].count++;
                stats.referenceBreakdown[reference].quantity += Math.abs(parseInt(row.quantity || 0));
                stats.referenceBreakdown[reference].cost += parseFloat(row.total_cost || 0);
            });

            return {
                summary: {
                    period: { startDate, endDate },
                    product: productId ? result.rows[0]?.product_name : 'Todos',
                    type: type || 'Todos',
                    ...stats
                },
                data: result.rows.map(row => ({
                    id: row.id,
                    type: row.type,
                    quantity: parseInt(row.quantity || 0),
                    unitCost: parseFloat(row.unit_cost || 0),
                    totalCost: parseFloat(row.total_cost || 0),
                    referenceType: row.reference_type,
                    referenceNumber: row.reference_number,
                    description: row.description,
                    createdAt: row.created_at,
                    product: {
                        code: row.product_code,
                        name: row.product_name,
                        category: row.product_category,
                        unit: row.product_unit
                    },
                    user: row.user_name
                }))
            };

        } catch (error) {
            throw new Error(`Erro ao gerar relatório de movimentações: ${error.message}`);
        }
    }

    // Relatório financeiro consolidado
    async getFinancialReport(startDate, endDate) {
        try {
            // Buscar dados de vendas
            const salesQuery = `
                SELECT 
                    COUNT(*) as total_sales,
                    COALESCE(SUM(total_amount), 0) as total_sales_amount,
                    COALESCE(SUM(CASE WHEN paid = true THEN total_amount ELSE 0 END), 0) as paid_sales_amount,
                    COALESCE(SUM(CASE WHEN paid = false THEN total_amount ELSE 0 END), 0) as pending_sales_amount
                FROM sales 
                WHERE sale_date BETWEEN $1 AND $2
            `;

            // Buscar dados de contas a receber
            const receivableQuery = `
                SELECT 
                    COUNT(*) as total_receivable,
                    COALESCE(SUM(amount), 0) as total_receivable_amount,
                    COALESCE(SUM(CASE WHEN received = true THEN amount ELSE 0 END), 0) as received_amount,
                    COALESCE(SUM(CASE WHEN received = false THEN amount ELSE 0 END), 0) as pending_receivable_amount,
                    COUNT(CASE WHEN received = false AND due_date < CURRENT_DATE THEN 1 END) as overdue_count,
                    COALESCE(SUM(CASE WHEN received = false AND due_date < CURRENT_DATE THEN amount ELSE 0 END), 0) as overdue_amount
                FROM accounts_receivable 
                WHERE created_at BETWEEN $1 AND $2
            `;

            // Buscar dados de contas a pagar
            const payableQuery = `
                SELECT 
                    COUNT(*) as total_payable,
                    COALESCE(SUM(amount), 0) as total_payable_amount,
                    COALESCE(SUM(CASE WHEN paid = true THEN amount ELSE 0 END), 0) as paid_amount,
                    COALESCE(SUM(CASE WHEN paid = false THEN amount ELSE 0 END), 0) as pending_payable_amount,
                    COUNT(CASE WHEN paid = false AND due_date < CURRENT_DATE THEN 1 END) as overdue_payable_count,
                    COALESCE(SUM(CASE WHEN paid = false AND due_date < CURRENT_DATE THEN amount ELSE 0 END), 0) as overdue_payable_amount
                FROM accounts_payable 
                WHERE created_at BETWEEN $1 AND $2
            `;

            // Buscar movimentações de caixa
            const cashQuery = `
                SELECT 
                    COUNT(*) as total_movements,
                    COALESCE(SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END), 0) as total_cash_in,
                    COALESCE(SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END), 0) as total_cash_out
                FROM cash_movements 
                WHERE created_at BETWEEN $1 AND $2
            `;

            const [salesResult, receivableResult, payableResult, cashResult] = await Promise.all([
                query(salesQuery, [startDate, endDate]),
                query(receivableQuery, [startDate, endDate]),
                query(payableQuery, [startDate, endDate]),
                query(cashQuery, [startDate, endDate])
            ]);

            const sales = salesResult.rows[0];
            const receivable = receivableResult.rows[0];
            const payable = payableResult.rows[0];
            const cash = cashResult.rows[0];

            // Calcular indicadores
            const netCashFlow = parseFloat(cash.total_cash_in) - parseFloat(cash.total_cash_out);
            const netResult = parseFloat(receivable.received_amount) - parseFloat(payable.paid_amount);

            return {
                summary: {
                    period: { startDate, endDate },
                    netCashFlow,
                    netResult
                },
                sales: {
                    totalSales: parseInt(sales.total_sales),
                    totalAmount: parseFloat(sales.total_sales_amount),
                    paidAmount: parseFloat(sales.paid_sales_amount),
                    pendingAmount: parseFloat(sales.pending_sales_amount)
                },
                receivable: {
                    totalReceivable: parseInt(receivable.total_receivable),
                    totalAmount: parseFloat(receivable.total_receivable_amount),
                    receivedAmount: parseFloat(receivable.received_amount),
                    pendingAmount: parseFloat(receivable.pending_receivable_amount),
                    overdueCount: parseInt(receivable.overdue_count),
                    overdueAmount: parseFloat(receivable.overdue_amount)
                },
                payable: {
                    totalPayable: parseInt(payable.total_payable),
                    totalAmount: parseFloat(payable.total_payable_amount),
                    paidAmount: parseFloat(payable.paid_amount),
                    pendingAmount: parseFloat(payable.pending_payable_amount),
                    overdueCount: parseInt(payable.overdue_payable_count),
                    overdueAmount: parseFloat(payable.overdue_payable_amount)
                },
                cash: {
                    totalMovements: parseInt(cash.total_movements),
                    totalIn: parseFloat(cash.total_cash_in),
                    totalOut: parseFloat(cash.total_cash_out),
                    netFlow: netCashFlow
                }
            };

        } catch (error) {
            throw new Error(`Erro ao gerar relatório financeiro: ${error.message}`);
        }
    }

    // Método auxiliar para obter nome do mês
    getMonthName(month) {
        const months = [
            '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return months[month] || 'Mês inválido';
    }

    // Método para validar datas
    validateDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Datas inválidas fornecidas');
        }
        
        if (start > end) {
            throw new Error('Data inicial deve ser anterior à data final');
        }
        
        // Limitar a 1 ano de diferença para performance
        const oneYear = 365 * 24 * 60 * 60 * 1000;
        if (end - start > oneYear) {
            throw new Error('Período máximo permitido é de 1 ano');
        }
        
        return { start, end };
    }
}

module.exports = new ReportsService();
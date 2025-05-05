const { useState, useEffect } = React;

        const InventorySystem = () => {
            const [products, setProducts] = useState(() => {
                const savedProducts = localStorage.getItem('inventory-products');
                return savedProducts ? JSON.parse(savedProducts) : [
                    {
                        id: 1,
                        name: "Notebook Dell XPS 15",
                        sku: "DEL-XPS15-001",
                        category: "Eletrônicos",
                        quantity: 25,
                        price: 8999.90,
                        supplier: "Dell Brasil",
                        lastUpdated: "2023-10-15T10:30:00Z"
                    },
                    {
                        id: 2,
                        name: "Mouse Sem Fio Logitech MX Master 3",
                        sku: "LOG-MXM3-002",
                        category: "Periféricos",
                        quantity: 42,
                        price: 499.90,
                        supplier: "Logitech",
                        lastUpdated: "2023-10-18T14:15:00Z"
                    },
                    {
                        id: 3,
                        name: "Teclado Mecânico Keychron K2",
                        sku: "KEY-K2-003",
                        category: "Periféricos",
                        quantity: 8,
                        price: 699.90,
                        supplier: "Keychron",
                        lastUpdated: "2023-10-20T09:45:00Z"
                    }
                ];
            });
            
            const [formData, setFormData] = useState({
                name: '',
                sku: '',
                category: '',
                quantity: '',
                price: '',
                supplier: ''
            });
            
            const [editingId, setEditingId] = useState(null);
            const [searchTerm, setSearchTerm] = useState('');
            const [selectedCategory, setSelectedCategory] = useState('all');
            const [isLoading, setIsLoading] = useState(false);
            const [alert, setAlert] = useState(null);
            
            useEffect(() => {
                localStorage.setItem('inventory-products', JSON.stringify(products));
            }, [products]);
            
            const handleInputChange = (e) => {
                const { name, value } = e.target;
                setFormData({
                    ...formData,
                    [name]: value
                });
            };
            
            const handleSubmit = (e) => {
                e.preventDefault();
                
                if (!formData.name || !formData.sku || !formData.quantity || !formData.price) {
                    showAlert('Por favor, preencha todos os campos obrigatórios', 'error');
                    return;
                }
                
                if (editingId) {
                    // Editar produto existente
                    setProducts(products.map(product => 
                        product.id === editingId ? {
                            ...product,
                            ...formData,
                            quantity: parseInt(formData.quantity),
                            price: parseFloat(formData.price),
                            lastUpdated: new Date().toISOString()
                        } : product
                    ));
                    showAlert('Produto atualizado com sucesso!', 'success');
                } else {
                    // Adicionar novo produto
                    const newProduct = {
                        id: Date.now(),
                        ...formData,
                        quantity: parseInt(formData.quantity),
                        price: parseFloat(formData.price),
                        lastUpdated: new Date().toISOString()
                    };
                    
                    setProducts([newProduct, ...products]);
                    showAlert('Produto adicionado com sucesso!', 'success');
                }
                
                // Resetar formulário
                setFormData({
                    name: '',
                    sku: '',
                    category: '',
                    quantity: '',
                    price: '',
                    supplier: ''
                });
                setEditingId(null);
            };
            
            const editProduct = (product) => {
                setFormData({
                    name: product.name,
                    sku: product.sku,
                    category: product.category,
                    quantity: product.quantity.toString(),
                    price: product.price.toString(),
                    supplier: product.supplier || ''
                });
                setEditingId(product.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
            
            const deleteProduct = (id) => {
                setProducts(products.filter(product => product.id !== id));
                showAlert('Produto removido com sucesso!', 'success');
            };
            
            const updateStock = (id, change) => {
                setProducts(products.map(product => {
                    if (product.id === id) {
                        const newQuantity = product.quantity + change;
                        return {
                            ...product,
                            quantity: newQuantity >= 0 ? newQuantity : 0,
                            lastUpdated: new Date().toISOString()
                        };
                    }
                    return product;
                }));
            };
            
            const showAlert = (message, type) => {
                setAlert({ message, type });
                setTimeout(() => setAlert(null), 3000);
            };
            
            const getStockStatus = (quantity) => {
                if (quantity === 0) return 'status-out-of-stock';
                if (quantity <= 10) return 'status-low-stock';
                return 'status-in-stock';
            };
            
            const getStatusText = (quantity) => {
                if (quantity === 0) return 'Sem Estoque';
                if (quantity <= 10) return 'Estoque Baixo';
                return 'Em Estoque';
            };
            
            const filteredProducts = products.filter(product => {
                const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
                return matchesSearch && matchesCategory;
            });
            
            const categories = ['all', ...new Set(products.map(product => product.category).filter(Boolean))];
            
            const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
            const totalItems = products.reduce((sum, product) => sum + product.quantity, 0);
            const lowStockItems = products.filter(product => product.quantity > 0 && product.quantity <= 10).length;
            const outOfStockItems = products.filter(product => product.quantity === 0).length;
            
            return (
                <div className="min-h-screen bg-gray-50">
                    {/* Header */}
                    <header className="gradient-bg text-white shadow-lg">
                        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-3xl font-bold">Mainstoragee</h1>
                                    <p className="opacity-90 mt-1">Gerencie seu inventário com eficiência</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="bg-blue-500/20 p-3 rounded-lg">
                                        <i className="fas fa-boxes text-2xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                    
                    {/* Main Content */}
                    <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                        {/* Alert */}
                        {alert && (
                            <div className={`mb-6 p-4 rounded-lg ${alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {alert.message}
                            </div>
                        )}
                        
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500">Valor Total</p>
                                        <h3 className="text-2xl font-bold mt-1">
                                            {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </h3>
                                    </div>
                                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                                        <i className="fas fa-dollar-sign"></i>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500">Itens no Estoque</p>
                                        <h3 className="text-2xl font-bold mt-1">{totalItems}</h3>
                                    </div>
                                    <div className="bg-green-100 p-3 rounded-lg text-green-600">
                                        <i className="fas fa-box-open"></i>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500">Estoque Baixo</p>
                                        <h3 className="text-2xl font-bold mt-1">{lowStockItems}</h3>
                                    </div>
                                    <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600">
                                        <i className="fas fa-exclamation-triangle"></i>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500">Sem Estoque</p>
                                        <h3 className="text-2xl font-bold mt-1">{outOfStockItems}</h3>
                                    </div>
                                    <div className="bg-red-100 p-3 rounded-lg text-red-600">
                                        <i className="fas fa-times-circle"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Product Form */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                            <div className="bg-blue-50 px-6 py-4 border-b">
                                <h2 className="text-xl font-semibold text-green-800">
                                    {editingId ? 'Editar Produto' : 'Adicionar Novo Produto'}
                                </h2>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nome do Produto <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                placeholder="Ex: Notebook Dell XPS 15"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                SKU <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="sku"
                                                value={formData.sku}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                placeholder="Ex: DEL-XPS15-001"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Categoria
                                            </label>
                                            <input
                                                type="text"
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                placeholder="Ex: Eletrônicos"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Quantidade <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={formData.quantity}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                placeholder="Ex: 25"
                                                min="0"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Preço (R$) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                placeholder="Ex: 8999.90"
                                                step="0.01"
                                                min="0"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Fornecedor
                                            </label>
                                            <input
                                                type="text"
                                                name="supplier"
                                                value={formData.supplier}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                placeholder="Ex: Dell Brasil"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 flex justify-end space-x-3">
                                        {editingId && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingId(null);
                                                    setFormData({
                                                        name: '',
                                                        sku: '',
                                                        category: '',
                                                        quantity: '',
                                                        price: '',
                                                        supplier: ''
                                                    });
                                                }}
                                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        >
                                            {editingId ? 'Atualizar Produto' : 'Adicionar Produto'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        
                        {/* Product List */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="bg-green-50 px-6 py-4 border-b flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-green-800">Lista de Produtos</h2>
                                <div className="flex space-x-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Buscar produtos..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        />
                                        <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                                    </div>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    >
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category === 'all' ? 'Todas Categorias' : category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-4 text-center">
                                                    <div className="flex justify-center items-center space-x-2">
                                                        <div className="animate-pulse h-8 w-8 bg-green-200 rounded-full"></div>
                                                        <span>Carregando produtos...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                                    Nenhum produto encontrado
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredProducts.map(product => (
                                                <tr key={product.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="font-medium text-gray-900">{product.name}</div>
                                                        {product.supplier && (
                                                            <div className="text-sm text-gray-500">Fornecedor: {product.supplier}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {product.sku}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {product.category || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center space-x-2">
                                                            <span>{product.quantity}</span>
                                                            <div className="flex space-x-1">
                                                                <button
                                                                    onClick={() => updateStock(product.id, -1)}
                                                                    className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded hover:bg-red-200"
                                                                    title="Remover 1"
                                                                >
                                                                    <i className="fas fa-minus text-xs"></i>
                                                                </button>
                                                                <button
                                                                    onClick={() => updateStock(product.id, 1)}
                                                                    className="w-6 h-6 flex items-center justify-center bg-green-100 text-green-600 rounded hover:bg-green-200"
                                                                    title="Adicionar 1"
                                                                >
                                                                    <i className="fas fa-plus text-xs"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatus(product.quantity)}`}>
                                                            {getStatusText(product.quantity)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-3">
                                                            <button
                                                                onClick={() => editProduct(product)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                                title="Editar"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button
                                                                onClick={() => deleteProduct(product.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Excluir"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                    Mostrando <span className="font-medium">{filteredProducts.length}</span> de <span className="font-medium">{products.length}</span> produtos
                                </div>
                                <button
                                    onClick={() => {
                                        setIsLoading(true);
                                        setTimeout(() => {
                                            setIsLoading(false);
                                            showAlert('Lista de produtos atualizada!', 'success');
                                        }, 1000);
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-800"
                                >
                                    <i className="fas fa-sync-alt mr-2"></i> Atualizar
                                </button>
                            </div>
                        </div>
                    </main>
                    
                    {/* Footer */}
                    <footer className="bg-white border-t mt-12 py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex flex-col md:flex-row justify-between items-center">
                                <div className="text-center md:text-left mb-4 md:mb-0">
                                    <p className="text-gray-600">© {new Date().getFullYear()} GusttaavoMelo</p>
                                </div>
                                <div className="flex space-x-6">
                                    <a href="https://github.com/GusttaavoMelo" className="text-gray-400 hover:text-blue-600">
                                        <i className="fab fa-github text-xl"></i>
                                    </a>
                                    <a href="https://www.linkedin.com/in/desenvolvedor-front-end-gustavo-melo" className="text-gray-400 hover:text-blue-600">
                                        <i className="fab fa-linkedin text-xl"></i>
                                    </a>
                                    <a href="https://gusttaavomeloo.netlify.app/" className="text-gray-400 hover:text-blue-600">
                                    <i className="fas fa-code text-xl"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            );
        };

        const App = () => {
            return <InventorySystem />;
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
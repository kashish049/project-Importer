import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit, Search, RefreshCw, Plus } from 'lucide-react';
import ProductModal from './ProductModal';
import ConfirmModal from './ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ProductTable({ refreshTrigger }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, sku: null });
    const limit = 50;

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/products/?skip=${page * limit}&limit=${limit}`);
            if (response.data.length < limit) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [page, refreshTrigger]);

    const handleDelete = async (sku) => {
        try {
            await axios.delete(`${API_URL}/api/products/${sku}`);
            fetchProducts();
        } catch (error) {
            alert("Failed to delete product: " + (error.response?.data?.detail || error.message));
        }
    };

    const handleDeleteAll = async () => {
        try {
            await axios.delete(`${API_URL}/api/products/`);
            setPage(0);
            fetchProducts();
        } catch (error) {
            alert("Failed to delete all products: " + (error.response?.data?.detail || error.message));
        }
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedProduct(null);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setSelectedProduct(null);
    };

    const handleModalSuccess = () => {
        fetchProducts();
    };

    const filteredProducts = products.filter(product =>
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Products</h2>
                    <div className="flex gap-2">
                        <button onClick={handleCreate} className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-1">
                            <Plus className="w-4 h-4" /> Add Product
                        </button>
                        <button onClick={fetchProducts} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setConfirmModal({ isOpen: true, type: 'deleteAll', sku: null })}
                            className="bg-red-100 text-red-600 px-3 py-1 rounded-md hover:bg-red-200 text-sm font-medium"
                        >
                            Delete All
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by SKU, name, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-md text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4 text-gray-500">No products found</td></tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.sku} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.sku}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{product.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {product.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900 mr-3">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setConfirmModal({ isOpen: true, type: 'deleteSingle', sku: product.sku })}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex justify-between items-center">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-3 py-1 border rounded-md disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">Page {page + 1}</span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={!hasMore}
                        className="px-3 py-1 border rounded-md disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            <ProductModal
                isOpen={modalOpen}
                onClose={handleModalClose}
                product={selectedProduct}
                onSuccess={handleModalSuccess}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, type: null, sku: null })}
                onConfirm={() => {
                    if (confirmModal.type === 'deleteSingle') {
                        handleDelete(confirmModal.sku);
                    } else if (confirmModal.type === 'deleteAll') {
                        handleDeleteAll();
                    }
                }}
                title={confirmModal.type === 'deleteAll' ? 'Delete All Products' : 'Delete Product'}
                message={
                    confirmModal.type === 'deleteAll'
                        ? 'Are you sure you want to delete ALL products? This action cannot be undone.'
                        : `Are you sure you want to delete product "${confirmModal.sku}"? This action cannot be undone.`
                }
            />
        </>
    );
}

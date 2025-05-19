import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase/config';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const SavedPrompts = ({ onSelectPrompt }) => {
    const [savedPrompts, setSavedPrompts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const { user } = useAuth();

    const fetchSavedPrompts = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const q = query(
                collection(db, 'savedPrompts'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const prompts = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            setSavedPrompts(prompts);
        } catch (error) {
            console.error('Error fetching saved prompts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedPrompts();
    }, [user]);

    const handleCopyPrompt = (prompt) => {
        navigator.clipboard.writeText(prompt);
        alert('Prompt copied to clipboard!');
    };

    const handleSelectPrompt = (prompt) => {
        if (onSelectPrompt) {
            onSelectPrompt(prompt);
        }
    };

    const handleDeletePrompt = async (id) => {
        if (window.confirm('Are you sure you want to delete this prompt?')) {
            setDeleting(true);
            try {
                await deleteDoc(doc(db, 'savedPrompts', id));
                // Update the local state to remove the deleted prompt
                setSavedPrompts(savedPrompts.filter(prompt => prompt.id !== id));
            } catch (error) {
                console.error('Error deleting prompt:', error);
                alert('Failed to delete prompt');
            } finally {
                setDeleting(false);
            }
        }
    };

    if (loading) {
        return <div className="text-center py-4">Loading saved prompts...</div>;
    }

    if (savedPrompts.length === 0) {
        return <div className="text-center py-4 text-gray-500">No saved prompts yet</div>;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Saved Prompts</h3>
            <div className="max-h-96 overflow-y-auto">
                {savedPrompts.map((item) => (
                    <div key={item.id} className="border rounded-lg p-3 mb-3 bg-gray-50">
                        <div className="flex items-start space-x-3">
                            {item.imagePreview && (
                                <img 
                                    src={item.imagePreview} 
                                    alt="Reference" 
                                    className="w-16 h-16 object-cover rounded"
                                />
                            )}
                            <div className="flex-1">
                                <p className="text-sm text-gray-700 mb-2 line-clamp-3">{item.prompt}</p>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleCopyPrompt(item.prompt)}
                                        className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                                    >
                                        Copy
                                    </button>
                                    <button
                                        onClick={() => handleSelectPrompt(item.prompt)}
                                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                                    >
                                        Use
                                    </button>
                                    <button
                                        onClick={() => handleDeletePrompt(item.id)}
                                        disabled={deleting}
                                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SavedPrompts;
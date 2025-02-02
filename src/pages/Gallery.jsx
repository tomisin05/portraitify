// import React, { useEffect, useState } from 'react';
// import { db } from '../lib/firebase/config';
// import { collection, query, where, getDocs } from 'firebase/firestore';
// import { auth } from '../lib/firebase/config';

// const Gallery = () => {
//     const [portraits, setPortraits] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const userId = auth.currentUser.uid;
    
//     useEffect(() => {
//         const fetchPortraits = async () => {
//             try {
//                 const q = query(collection(db, 'portraits'), where('userId', '==', userId));
//                 const querySnapshot = await getDocs(q);
//                 const portraitsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//                 setPortraits(portraitsData);
//             } catch (error) {
//                 console.error('Error fetching portraits:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchPortraits();
//     }, [userId]);

//     const downloadImage = async (url) => {
//         try {
//             const response = await fetch(url);
//             if (!response.ok) throw new Error('Network response was not ok');
//             const blob = await response.blob();
//             const link = document.createElement('a');
//             link.href = window.URL.createObjectURL(blob);
//             link.setAttribute('download', 'portrait.png'); // Customize the filename
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//         } catch (error) {
//             console.error('Error downloading image:', error);
//             alert('Failed to download image');
//         }
//     };

//     if (loading) {
//         return <div>Loading...</div>;
//     }

//     return (
//         <div className="container mx-auto px-4 py-8">
//             <h1 className="text-3xl font-bold mb-4">Your Portraits</h1>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {portraits.map(portrait => (
//                     <div key={portrait.id} className="border rounded-lg p-4">
//                         <img src={portrait.generatedImage} alt="Generated Portrait" className="w-full h-auto rounded" />
//                         <button
//                             onClick={() => downloadImage(portrait.generatedImage)}
//                             className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
//                         >
//                             Download
//                         </button>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default Gallery;











// import React, { useEffect, useState } from 'react';
// import { db } from '../lib/firebase/config';
// import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
// import { auth } from '../lib/firebase/config';

// const Gallery = () => {
//     const [portraits, setPortraits] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const userId = auth.currentUser.uid;

//     useEffect(() => {
//         const fetchPortraits = async () => {
//             try {
//                 // Fetch all models for the user
//                 const q = query(collection(db, 'models'), where('userId', '==', userId));
//                 const querySnapshot = await getDocs(q);
//                 const modelsData = await Promise.all(querySnapshot.docs.map(async (doc) => {
//                     const modelData = doc.data();
//                     const generatedImages = modelData.generatedImages || [];
//                     return { id: doc.id, ...modelData, generatedImages };
//                 }));

//                 // Flatten the generated images into a single array
//                 const allPortraits = modelsData.flatMap(model => 
//                     model.generatedImages.map(image => ({
//                         id: model.id, // You can use model ID or generate a unique ID
//                         generatedImage: image,
//                         modelName: model.name // Optional: include model name if needed
//                     }))
//                 );

//                 setPortraits(allPortraits);
//             } catch (error) {
//                 console.error('Error fetching portraits:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchPortraits();
//     }, [userId]);

//     const downloadImage = async (url) => {
//         try {
//             const response = await fetch(url);
//             if (!response.ok) throw new Error('Network response was not ok');
//             const blob = await response.blob();
//             const link = document.createElement('a');
//             link.href = window.URL.createObjectURL(blob);
//             link.setAttribute('download', 'portrait.png'); // Customize the filename
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//         } catch (error) {
//             console.error('Error downloading image:', error);
//             alert('Failed to download image');
//         }
//     };

//     if (loading) {
//         return <div>Loading...</div>;
//     }

//     return (
//         <div className="container mx-auto px-4 py-8">
//             <h1 className="text-3xl font-bold mb-4">Your Portraits</h1>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {portraits.map(portrait => (
//                     <div key={portrait.id} className="border rounded-lg p-4">
//                         <img src={portrait.generatedImage} alt="Generated Portrait" className="w-full h-auto rounded" />
//                         <button
//                             onClick={() => downloadImage(portrait.generatedImage)}
//                             className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
//                         >
//                             Download
//                         </button>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default Gallery;




import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth } from '../lib/firebase/config';

const Gallery = () => {
    console.log("User visited Gallery")
    const [portraits, setPortraits] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = auth.currentUser.uid; // Get the current user's ID

    useEffect(() => {
        const fetchPortraits = async () => {
            try {
                // Query to fetch portraits for the current user
                const q = query(collection(db, 'portraits'), where('userId', '==', userId));
                const querySnapshot = await getDocs(q);
                
                // Map through the documents and extract the generated images
                const allPortraits = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        generatedImages: data.generatedImages || [],
                    };
                });

                // Flatten the generated images into a single array
                const flattenedPortraits = allPortraits.flatMap(portrait => 
                    portrait.generatedImages.map(image => ({
                        id: portrait.id, // Use portrait ID or generate a unique ID
                        generatedImage: image,
                    }))
                );

                setPortraits(flattenedPortraits);
            } catch (error) {
                console.error('Error fetching portraits:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPortraits();
    }, [userId]);

    const downloadImage = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute('download', 'portrait.png'); // Customize the filename
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading image:', error);
            alert('Failed to download image');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Your Portraits</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portraits.map((portrait, index) => (
                <div key={`${portrait.id}-${index}`} className="border rounded-lg p-4">
                    <img src={portrait.generatedImage} alt="Generated Portrait" className="w-full h-auto rounded" />
                    <button
                        onClick={() => downloadImage(portrait.generatedImage)}
                        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Download
                    </button>
                </div>
            ))}
            </div>
        </div>
    );
};

export default Gallery;

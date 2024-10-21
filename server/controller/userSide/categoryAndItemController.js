const Category = require("../../model/categorySchema");
const Item = require("../../model/itemSchema");


exports.homeCategoryShow = async (req, res) => {
    const categoryList = await Category.find({ status: true });
    res.send(categoryList);
};

// exports.ourMenuList = async (req, res) => {
//     console.log('mn');
    
//     try {
//         console.log('try mn');
        
//         const category = req.query.category || 'Starters';
//         const categories = await Category.find({ status: true });
//         const items = await Item.find({ category: category });
//         if(!categories){
//             categories = 'Starters'
//         }

//         const data = {
//             items: items,
//             categories: categories,
//             selectedCategory: category
//         };
//         console.log('data',data);
        
//         res.send(data);
//         // res.json(data);

//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Internal server error");
//     }
// };


// API endpoint for fetching menu items
// exports.ourMenuList = async (req, res) => {
//     try {
//         const category = req.query.category || 'Starters';
//         const categories = await Category.find({ status: true }); 
//         const items = await Item.find({ category: category });

//         const data = {
//             items: items,
//             categories: categories,
//             selectedCategory: category
//         };
        
//         res.json(data);
//         // console.log('menu contro',req.query.category);
        
//         // const category = req.query.category || 'Starters';
//         // const categories = await Category.find({ status: true });
//         // const items = await Item.find({ category: category });

//         // const data = {
//         //     items: items,
//         //     categories: categories,
//         //     selectedCategory: category
//         // };
        
//         // res.json(data); // Ensure this sends JSON
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };
// API endpoint for fetching menu items
exports.ourMenuList = async (req, res) => {
    try {
        console.log('Fetching menu for category:', req.query.category); // Debugging - Log category
        const category = req.query.category || 'Starters';
        const categories = await Category.find({ status: true });
        // const items = await Item.find({ category: category });
        const items = await Item.find({ 
            category: category, 
            listed: true, 
            isCategory: true 
        });
          

        const data = {
            items: items,
            categories: categories,
            selectedCategory: category
        };
        
        // console.log('Data sent to client:', data); // Debugging - Log the data sent to the client
        res.json(data); // Ensure this sends JSON
    } catch (err) {
        console.error('Error in fetching menu:', err); // Debugging - Log errors
        res.status(500).json({ error: 'Internal server error' });
    }
};

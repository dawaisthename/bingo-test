import express from 'express';
import { Request, Response } from 'express';
import ConnectToDatabase from '../config/db';
import bcrypt from 'bcrypt';
import ParnershipModel from '../model/Partnership';
import CallerModel from '../model/Caller';
import SalesModel from '../model/Sales';
import SuperAdminModel from '../model/SuperAdmin';
import PackageModel from '../model/Package';
import jwt from 'jsonwebtoken';
import { jwtDecode } from "jwt-decode";
import { authorize_super_admin, authorize_caller, authorize_partnership } from '../middleware/auth';
// import TotalProfitModel from '../model/TotalProfit';
import mongoose, { Document, Schema } from 'mongoose';
import UserPackageModel, { IUserPackageDocument } from '../model/UserPackage';
import Cartella from '../model/Cartella';
import { error } from 'console';



const router = express.Router();

// jwt secret key
const JWT_Secret = process.env.JWT_KEY;


if(!JWT_Secret){
    throw new Error('JWT Secret key not found!');
}

// connect to db
ConnectToDatabase();

// api check
router.get('/status', async(req: Request, res: Response)=>{
    res.status(200).json({
        status: "OK"
    })
});


// Define Package Schema
interface PackageDocument extends Document {
    _id: mongoose.Types.ObjectId;
    packageName: string;
    packageAmount: number;
}

// Define UserPackage Schema
interface UserPackage extends Document {
    user_id: mongoose.Types.ObjectId;
    packages: Array<{
        package: mongoose.Types.ObjectId;
        balance: number;
    }>;
}



// Add super admin
router.post('/add-super-admin',authorize_super_admin ,async(req: Request, res: any)=>{

    const token = req.headers.authorization;

    if(!token){
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded: any = jwtDecode(token);
    const _type = decoded.type;

    const {username, password, email, type} = req.body;

    if(!type){
        res.status(400).json({
            status: 'bad request'
        })
    }

    if(_type === "1"){
        try{
            // hash password using bcrypt
            const hashedPassword = await bcrypt.hash(password, 10);
   
            SuperAdminModel.create({
               username,
               password: hashedPassword,
               email,
               type
            })
            res.status(201).json({
                status: 'accout created successfully'
            })
       } catch(error){
           res.status(400).json({
               status: 'bad request'
           })
       }
    } else {
        res.status(403).json({
            error: 'Unauthorized to add super admin'
        });
    }
   
});

// Update/edit super-admin
router.post('/update-super-admin-pwd',authorize_super_admin ,async(req: Request, res: any)=>{

    const token = req.headers.authorization;

    if(!token){
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const {_id, confirm_password} = req.body;
    const _super_admin = await SuperAdminModel.findById(_id);

    const decoded: any = jwtDecode(token);
    const type = decoded.type;

    // hash password using bcrypt
    const hashedPassword = await bcrypt.hash(confirm_password, 10);

    if(!_super_admin){
        return res.status(404).json({ error: 'user not found' });
    }

    if(type === "1"){
        try{
            _super_admin.password = hashedPassword || _super_admin.password;

            _super_admin.save();
            res.status(200).json(
                {
                 status: 'ok'
                }
            );
        } catch{
            res.status(400).json(
                {
                 status: 'bad request'
                }
            );
        }
    } else{
        res.status(403).json({
            status: 'Unauthorized to change admin password'
        });
    }
    
});

// admin list
router.get('/super-admin-list',authorize_super_admin,  async(req: Request, res: Response)=>{
    try{
        const super_admin = await SuperAdminModel.find();
        res.status(200).json(super_admin);
    }catch(error){
        res.status(500).json({
            status: "internal sever error!"
        })
    }
});




// Register partnership
router.post('/register-partnership',authorize_super_admin ,async(req: Request, res: Response)=>{
    const {partnership_name, phone, location, username, password, percent} = req.body;

    try{
        // hash password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        await ParnershipModel.create({
            partnership_name,
            phone,
            location,
            username,
            password: hashedPassword,
            status: 1, // add partnership as active
            percent
        });

        res.status(201).json({
            status: 'ok'
        });
    }catch(error){
        res.status(400).json({
            status: 'bad request'
        });
    }

});

// Edit partnership from super admin
router.post('/edit-partnership',authorize_super_admin, async (req: Request, res: any) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const decoded: any = jwtDecode(token);

  const { _id, new_partnership_name, new_phone, new_location, new_status, new_percent } = req.body;

  const _partnership = await ParnershipModel.findById(_id);

  if (!_partnership) {
    return res.status(404).json({
      error: 'Partnership not found',
    });
  }

  // Ensure the user making the request is authorized to update the partnership
    try {
      // Update partnership details if provided
      if (new_partnership_name) {
        _partnership.partnership_name = new_partnership_name;
      }

      if (new_phone) {
        _partnership.phone = new_phone;
      }

      if (new_location) {
        _partnership.location = new_location;
      }

      if (new_status) {
        _partnership.status = new_status;
      }

      if (new_status) {
        _partnership.percent = new_percent;
      }

      await _partnership.save();

      return res.status(200).json({
        status: 'Partnership updated successfully',
      });
    } catch (error: any) {
      console.error(error); // Log the error for debugging
      return res.status(400).json({
        status: 'Bad request',
        error: 'true',
      });
    }
});


// Edit partnership from partner
router.post('/edit-partnership-profile',authorize_partnership ,async(req: Request, res: any)=>{
    const {_id, new_partnership_name, new_phone, new_location} = req.body;

    const _partnership = await ParnershipModel.findById(_id);

    if(!_partnership){
        return res.status(404).json({
            error: 'caller not found'
        })
    }
    
    try{
        // update
        _partnership.partnership_name = new_partnership_name || _partnership.partnership_name;
        _partnership.phone = new_phone || _partnership.phone;
        _partnership.location = new_location || _partnership.location;
        
    }catch(error){
        res.status(400).json({
            status: 'bad request'
        });
    }
});

router.get('/partnership-list',authorize_super_admin, async (req: Request, res: any) => {
    try {
        // Fetch all partnerships, excluding passwords
        const partnership_list = await ParnershipModel.find().select("-password");

        // Loop through each partnership and find the corresponding balance
        const updatedPartnershipList = await Promise.all(partnership_list.map(async (partnership) => {
            // Find the user's packages based on the user_id (assuming user_id is the field that matches partnership._id)
            const userPackage = await UserPackageModel.findOne({ user_id: partnership._id });

            // Calculate the total balance by summing up the balance of all packages
            const totalBalance = userPackage ? userPackage.packages.reduce((sum, pkg) => sum + pkg.balance, 0) : 0;

            // Return partnership data with total balance
            return {
                ...partnership.toObject(), // Convert mongoose document to plain JS object
                totalBalance, // Add total balance to partnership data
            };
        }));

        // Send the updated partnership list with balance
        res.status(200).json(updatedPartnershipList);
    } catch (error) {
        console.error("Error fetching partnerships with balances:", error);
        res.status(500).json({
            status: "Internal Server Error!"
        });
    }
});


// delete partnership
router.post('/delete-partnership',authorize_super_admin, async (req: Request, res: any) => {
    const { partnership_id	 } = req.body;

    // Validate input
    if (!partnership_id	 || !mongoose.isValidObjectId(partnership_id)) {
        return res.status(400).json({
            status: 'Bad request',
            message: 'Invalid or missing partnership_id	'
        });
    }

    try {
        const caller = await ParnershipModel.findByIdAndDelete(partnership_id);

        if (!caller) {
            return res.status(404).json({
                status: 'Not found',
                message: 'Partnership not found'
            });
        }

        res.status(200).json({
            status: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting caller:', error); // Log the error for debugging
        res.status(500).json({
            status: 'Internal server error',
            message: 'An error occurred while deleting the caller'
        });
    }
});


// delete super-admin
router.post('/delete-super-admin',authorize_super_admin, async (req: Request, res: any) => {
    const { superadmin_id	 } = req.body;

    // Validate input
    if (!superadmin_id || !mongoose.isValidObjectId(superadmin_id)) {
        return res.status(400).json({
            status: 'Bad request',
            message: 'Invalid or missing superadmin_id'
        });
    }

    try {
        const caller = await SuperAdminModel.findByIdAndDelete(superadmin_id);

        if (!caller) {
            return res.status(404).json({
                status: 'Not found',
                message: 'SuperAdmin not found'
            });
        }

        res.status(200).json({
            status: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting caller:', error); // Log the error for debugging
        res.status(500).json({
            status: 'Internal server error',
            message: 'An error occurred while deleting the caller'
        });
    }
});

// statistics
router.get('/partnership/statistics',authorize_partnership, async(req: Request, res: any)=>{

    const token = req.headers.authorization;
    if(!token){
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded: any = jwtDecode(token);
    const pid = decoded.partnership_id;

    // Total User
    const total_users = await CallerModel.find({owner: pid}).countDocuments();

    // Balance
    // Find the user's packages based on the user_id (assuming user_id is the field that matches partnership._id)
    const userPackage = await UserPackageModel.findOne({ user_id: pid});

    // Calculate the total balance by summing up the balance of all packages
    const total_balance = userPackage ? userPackage.packages.reduce((sum, pkg) => sum + pkg.balance, 0) : 0;



    // Sales
    const sales = await SalesModel.aggregate([
        { 
          $match: { partnership_id: pid } // Match documents with the specific partnership_id
        },
        { 
          $group: {
            _id: null,
            totalCut: { $sum: { $toDouble: "$cut" } } // Convert 'cut' to a number and sum it
          }
        }
      ]);
      
      // Extract the total cut or default to 0 if no results
      const total_sales = sales.length > 0 ? sales[0].totalCut : 0;
      
    // Total games
    const total_games = await SalesModel.find({partnership_id: pid}).countDocuments();

    try{
        res.status(200).json({
            total_users,
            total_games,
            total_sales,
            total_balance
        })
    } catch(error){
        res.status(500).json({
            error: 'internal server error.'
        })
    }
});

// statistics
router.get('/super-admin/statistics',authorize_super_admin, async(req: Request, res: Response)=>{

    const total_partnership = await ParnershipModel.countDocuments();
    const total_package = await PackageModel.countDocuments();
    const inactive_partnership = await ParnershipModel.countDocuments({ status: 0 });

    try{
        res.status(200).json({
            total_partnership,
            active_partnership: total_partnership - inactive_partnership,
            inactive_partnership,
            total_package,
        })
    } catch(error){
        res.status(500).json({
            error: 'internal server error.'
        })
    }
});




// add caller
router.post('/add-caller',authorize_partnership, async(req: Request, res: any)=>{

    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded: any = jwtDecode(token);
    const partnership_id = decoded.partnership_id;
    const {username, location, branch_name,phone, password } = req.body;

    try{
        // hash password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        await CallerModel.create({
            username,
            password: hashedPassword,
            branch_name,
            phone,
            owner: partnership_id,
            location
        });

        res.status(200).json({
            status: 'User created successfuly'
        })
    } catch(error){
        console.log(error);
        res.status(400).json({
            status: 'bad request'
        })
    }
});

// update caller
router.post('/edit-caller',authorize_partnership, async (req: Request, res: any) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded: any = jwtDecode(token);
    const partnership_id = decoded.partnership_id;

    const { _id, new_username, new_password, new_branch_name, new_location } = req.body;

    const _caller = await CallerModel.findById(_id);

    if (!_caller) {
        return res.status(404).json({
            error: 'Caller not found'
        });
    }

    if (partnership_id === _caller.owner) {
        try {
            // Only update the username if provided
            if (new_username) {
                _caller.username = new_username;
            }

            // Only hash and update the password if a new password is provided
            if (new_password && new_password !== '') {
                _caller.password = await bcrypt.hash(new_password, 10);
            }

            // Only update branch name if provided
            if (new_branch_name) {
                _caller.branch_name = new_branch_name;
            }

            // Only update location if provided
            if (new_location) {
                _caller.location = new_location;
            }

            await _caller.save();
            res.status(200).json({
                status: 'Caller updated successfully'
            });

        } catch (error: any) {
            console.error(error); // Log the error for debugging
            res.status(400).json({
                status: 'Bad request',
                error: error.message || 'An error occurred'
            });
        }
    } else {
        res.status(403).json({
            error: 'Unauthorized to update this user!'
        });
    }
});


// Callers/users list
router.get('/caller-list',authorize_partnership, async(req: Request, res: any)=>{
    const token = req.headers.authorization;

    if(!token){
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded: any = jwtDecode(token);
    const owner = decoded.partnership_id;
    try{
        const caller_list = await CallerModel.find({owner}).select("-password");
        res.status(200).json(caller_list);
    }catch(error){
        res.status(500).json({
            status: "internal sever error!"
        });
    }
});



// Callers/users delete
router.post('/delete-caller', authorize_partnership, async (req: Request, res: any) => {
    const { caller_id } = req.body;

    // Validate input
    if (!caller_id || !mongoose.isValidObjectId(caller_id)) {
        return res.status(400).json({
            status: 'Bad request',
            message: 'Invalid or missing caller_id'
        });
    }

    try {
        const caller = await CallerModel.findByIdAndDelete(caller_id);

        if (!caller) {
            return res.status(404).json({
                status: 'Not found',
                message: 'Caller not found'
            });
        }

        res.status(200).json({
            status: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting caller:', error); // Log the error for debugging
        res.status(500).json({
            status: 'Internal server error',
            message: 'An error occurred while deleting the caller'
        });
    }
});

// 
// save sales data
// router.post('/start-game',authorize_caller, async(req: Request, res: any)=>{
//     const token = req.headers.authorization;

//     if(!token){
//         return res.status(401).json({ message: 'No token, authorization denied' });
//     }
    
//     const decoded: any = jwtDecode(token);
//     const partnership_id = decoded.caller_owner;
//     const {packageName, _percent, _players, _cartellaPrice} = req.body;

//     // Find the corresponding package
//     const packageDoc = await PackageModel.findOne({ packageName });
//     if (!packageDoc) {
//         return res.status(404).json({ message: 'Package not found' });
//     }

//     // ! Check if the user has the package!
//     let userPackages: IUserPackageDocument | null = await UserPackageModel.findOne({ user_id: partnership_id });
//     if(!userPackages){
//         return res.status(404).json({
//             error: 'Package not found!'
//         });
//     }

//     try{
//         if(!(parseInt(_percent) >= 4 && parseInt(_percent) <= 8)){
//             return res.status(403).json({
//                 error: 'Unsupported percent!'
//             })
//         } else if(!(parseInt(_players) >= 1)){
//             return res.status(403).json({
//                 error: 'number of players must be greater than zero'
//             })
//         }
//     } catch(error){
//         return res.status(400).json(
//             {
//              status: 'bad request'
//             }
//         );
//     }

//     // calculate deduction
//     const _deduction = ((_percent * 5)/100) * (_cartellaPrice	* _players);
//     // console.log(_deduction);
    
//     // Check if the user already owns this package using type assertion
//     const existingPackage = userPackages?.packages.find(pkg => {
//         // Use type assertion to inform TypeScript of the type
//         return (pkg.package as mongoose.Types.ObjectId).equals(packageDoc?._id as mongoose.Types.ObjectId);
//     });

//     if (existingPackage) {

//         if(existingPackage.balance >= 0){
//             // Update the balance of the existing package
//             // const deduction: number = pkg_amount * ((pkg_percent * 5)/ 100);
//             if(existingPackage.balance - _deduction >= 0){
//                 existingPackage.balance -= _deduction;
//                 await userPackages?.save();
//                 res.status(200).json({
//                     status: 'ok',
//                     message: 'Game started!'
//                 });
//             } else{
//                 res.status(403).json({
//                     status: 'error',
//                     message: 'You dont have enough balance!'
//                 });
//             }
//         }

//     } else {
//         res.status(404).json({
//             error: 'You dont have enough balance!'
//         });
//     }

// });
router.post('/start-game', authorize_caller, async (req: Request, res: any) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded: any = jwtDecode(token);
    const partnership_id = decoded.caller_owner;
    const { packageName, _percent, _players, _cartellaPrice } = req.body;

    try {
        // Find the corresponding package
        const packageDoc = await PackageModel.findOne({ packageName });
        if (!packageDoc) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Check if the user has the package
        const userPackages: IUserPackageDocument | null = await UserPackageModel.findOne({ user_id: partnership_id });
        if (!userPackages) {
            return res.status(404).json({ message: 'User packages not found!' });
        }

        // Validate _percent, cartellanumber and _players
        const percent = parseInt(_percent);
        const players = parseInt(_players);
        const cartellaPrice = parseFloat(_cartellaPrice);

        if (isNaN(percent) || percent < 4 || percent > 8) {
            return res.status(403).json({ message: 'Unsupported percent!' });
        }
        if (isNaN(players) || players < 1) {
            return res.status(403).json({ message: 'Number of players must be greater than zero!' });
        }
        if (isNaN(players) || players < 1) {
            return res.status(403).json({ message: 'Number of players must be greater than zero!' });
        }

        if (isNaN(cartellaPrice) || cartellaPrice < 10) {
            return res.status(403).json({ message: 'Cartella price must be greater than or equal to 10' });
        }

        // Calculate deduction
        const deduction = ((percent * 5) / 100) * (cartellaPrice * players);

        // Check if the user already owns this package
        const existingPackage = userPackages.packages.find(pkg => {
            return (pkg.package as mongoose.Types.ObjectId).equals(packageDoc._id as mongoose.Types.ObjectId);
        });

        if (existingPackage) {
            if (existingPackage.balance >= 0) {
                // Update the balance of the existing package
                if (existingPackage.balance - deduction >= 0) {
                    existingPackage.balance -= deduction;
                    await userPackages.save();
                    return res.status(200).json({ status: 'ok', message: 'Game started!' });
                } else {
                    return res.status(403).json({ status: 'error', message: 'You don’t have enough balance!' });
                }
            }
        } else {
            return res.status(404).json({ message: 'Package not found in user packages!' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error });
    }
});


// save sales data
router.post('/save-game-info',authorize_caller, async(req: Request, res: any)=>{
    const token = req.headers.authorization;

    if(!token){
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded: any = jwtDecode(token);
    const partnership_id = decoded.caller_owner;
    const branch_name = decoded.branch;
    const cashier = decoded.username;
    const {bet, players, winners, call, game_type, packageName} = req.body;

    const total_amount: number = parseInt(players) * parseFloat(bet);

    // Find the corresponding package
    const packageDoc = await PackageModel.findOne({ packageName });
    if (!packageDoc) {
        return res.status(404).json({ message: 'Package not found' });
    }

    // get package percent and amount
    const pkg_percent = packageDoc.percent;
    const pkg_amount = packageDoc.packageAmount;

    // ! Check if the user has the package!
    let userPackages: IUserPackageDocument | null = await UserPackageModel.findOne({ user_id: partnership_id });

    if(!userPackages){
        res.status(404).json({
            error: 'Package not found!'
        });
    }
    // Check if the user already owns this package using type assertion
    const existingPackage = userPackages?.packages.find(pkg => {
        // Use type assertion to inform TypeScript of the type
        return (pkg.package as mongoose.Types.ObjectId).equals(packageDoc?._id as mongoose.Types.ObjectId);
    });

    // if (existingPackage) {
    //     // Update the balance of the existing package
    //     const deduction: number = pkg_amount * (pkg_percent / 100);
    //     existingPackage.balance -= deduction;
    //     await userPackages?.save();
    // } else {
    //     res.status(404).json({
    //         error: 'Package not found!'
    //     });
    // }

    // Game type percent!
    const _percent: number = (parseInt(game_type) * 5) / 100;
    // Cut
    const cut: number = _percent * total_amount
    // player won
    const player_won: number = total_amount - cut;

    try{
        const saveGameInfo = await SalesModel.create({
            partnership_id,
            bet,
            players,
            total_amount,
            game_type,
            cut,
            player_won,
            branch_name,
            call,
            winners,
            cashier,
        });

        // console.log(saveGameInfo);
        res.status(200).json(
            {
             status: 'Game saved!'
            }
        )

    }catch(error){
        res.status(400).json(
            {
             status: 'bad request'
            }
        )
    }
});

// Sales list
router.get('/sales-list',authorize_partnership, async(req: Request, res: any)=>{
    const token = req.headers.authorization;

    if(!token){
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded: any = jwtDecode(token);
    const partnership_id = decoded.partnership_id;
    try{
        const sales_list = await SalesModel.find({partnership_id});
        // console.log(sales_list);
        res.status(200).json(sales_list);
    }catch(error){
        res.status(500).json({
            status: "internal sever error!"
        });
    }
});

// branch list
router.get('/branch-list', async (req: Request, res: any) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded: any = jwtDecode(token);
    const owner = decoded.partnership_id;

    try {
        const branch_list = await CallerModel.find({ owner });

        // Extracting branch_names into an array
        const branchNames = branch_list.map(branch => branch.branch_name);

        res.status(200).json(branchNames); // Sending branch_names as an array
    } catch (error) {
        res.status(500).json({
            status: "Internal server error!"
        });
    }
});


// Create Package
router.post('/add-package',authorize_super_admin, async (req: Request, res: any) => {
    const { packageAmount, packageName, percent } = req.body;

    try {
        // Create the package in the database
        await PackageModel.create({
            packageName,
            packageAmount,
            percent
        });
        
        // Respond with success if the package was created successfully
        res.status(201).json({
            status: "ok",
            message: "Package created successfully."
        });
    } catch (error: any) {
        // Check if the error is a MongoDB duplicate key error
        if (error.code === 11000 && error.keyPattern?.packageName) {
            // Handle duplicate packageName error
            return res.status(409).json({
                status: "error",
                message: `Package with name '${packageName}' already exists.`
            });
        }

        // Catch any other errors and return a generic bad request message
        res.status(400).json({
            status: "error",
            message: "Bad request. Could not create package.",
            error: error.message // Optional: include the error message for debugging
        });
    }
});



// Update/edit Package
router.post('/update-package',authorize_super_admin, async(req: Request, res: any)=>{
    
    const {_id, packageAmount, packageName, percent } = req.body;

    const _package = await PackageModel.findById(_id);

    if(!_package){
        return res.status(404).json({ error: 'package not found' });
    }

    try{
        _package.packageName = packageName || _package.packageName;
        _package.packageAmount = packageAmount || _package.packageAmount;
        _package.percent = percent || _package.percent;

        await _package.save();
        res.status(201).json({
            status: "ok"
        });
       
    } catch{
        res.status(400).json(
            {
             status: 'bad request'
            }
        )
    }
});

// list package
router.get('/package-list', async(req: Request, res: Response)=>{
    try{
        const package_list = await PackageModel.find();
        res.status(200).json(package_list);
    }catch(error){
        res.status(500).json({
            status: "internal sever error!"
        })
    }
});


// Transfer package
router.post('/transfer-package',authorize_super_admin, async (req: Request, res: any) => {
    const { packageType, phonenumber } = req.body;

    try {
        const user = await ParnershipModel.findOne({ phone: phonenumber }).select('_id');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userId = user._id;

        // Find the corresponding package
        const packageDoc = await PackageModel.findOne({ packageName: packageType });
        if (!packageDoc) {
            return res.status(404).json({ message: 'Package not found' });
        }

        const transferAmount = packageDoc.packageAmount;

        // Find the user's package document
        let userPackages: IUserPackageDocument | null = await UserPackageModel.findOne({ user_id: userId });

        if (!userPackages) {
            // Create a new user package entry if it doesn't exist
            userPackages = new UserPackageModel({
                user_id: userId,
                packages: [{
                    package: packageDoc._id,  // Store by package _id (ObjectId)
                    balance: transferAmount,
                }],
            });
        } else {
            // Check if the user already owns this package using type assertion
            const existingPackage = userPackages.packages.find(pkg => {
                // Use type assertion to inform TypeScript of the type
                return (pkg.package as mongoose.Types.ObjectId).equals(packageDoc._id as mongoose.Types.ObjectId);
            });

            if (existingPackage) {
                // Update the balance of the existing package
                existingPackage.balance += transferAmount;
            } else {
                // Add the new package
                userPackages.packages.push({
                    package: packageDoc._id,  // Store by package _id (ObjectId)
                    balance: transferAmount,
                });
            }
        }

        // Save the user's updated package data
        await userPackages.save();

        res.json({ message: 'Package transferred successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});



// DELETE Package Route
router.post('/delete-package',authorize_super_admin, async (req: Request, res: any) => {
    const { packageId } = req.body; // Get the package ID from the request body

    try {
        // Validate the ObjectId
        if (!mongoose.Types.ObjectId.isValid(packageId)) {
            return res.status(400).json({ message: 'Invalid package ID' });
        }

        // Check if the package is linked to any users
        const userPackages = await UserPackageModel.findOne({ 'packages.package': packageId });

        if (userPackages) {
            return res.status(400).json({ message: 'Package cannot be deleted as it is linked to users.' });
        }

        // If not linked, proceed to delete the package
        const result = await PackageModel.findByIdAndDelete(packageId);

        if (!result) {
            return res.status(404).json({ message: 'Package not found' });
        }

        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});



// Partnership-login
router.post('/partnership-login', async (req: Request, res: any) => {
    const { username, password } = req.body;
    
    try {
        const partnership = await ParnershipModel.findOne({ username });

        if (!partnership) {
            // user not found
            return res.status(404).json({ message: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, partnership.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if(partnership.status !== 0){
            // Create a JWT token upon successful authentication
            const token = jwt.sign({ 
                partnership_id: partnership._id, 
                username: partnership.username,  
                status: partnership.status, 
                role: 'partnership'}, 
                JWT_Secret, { expiresIn: '15h' });

            // Send the token in the response after successful login
            res.status(200).json({ message: 'Login successful', token });
        } else{
            res.status(403).json({
                message: 'Your account is deactivated.'
            });
        }

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Caller-login
router.post('/caller-login', async (req: Request, res: any) => {
    const { username, password } = req.body;
    
    try {
        const caller = await CallerModel.findOne({ username });

        if (!caller) {
            // user not found
            return res.status(404).json({ message: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, caller.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const partnership = await ParnershipModel.findById(caller.owner);

        if(partnership?.status !== 0){
            // Create a JWT token upon successful authentication
            const token = jwt.sign({ 
                caller_id: caller._id, 
                username: caller.username,  
                caller_owner: caller.owner, 
                branch: caller.branch_name, 
                role: 'caller'}, 
                JWT_Secret, { expiresIn: '15h' });

            // Send the token in the response after successful login
            res.status(200).json({ message: 'Login successful', token });
        }else{
            res.status(403).json({
                message: 'Your account is deactivated.'
            });
        }

        

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Super-admin-login
router.post('/super-admin-login', async (req: Request, res: any) => {
    const { username, password } = req.body;
    
    try {
        const super_admin = await SuperAdminModel.findOne({ username });

        if (!super_admin) {
            // user not found
            return res.status(404).json({ message: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, super_admin.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create a JWT token upon successful authentication
        const token = jwt.sign({ 
            super_admin_id: super_admin._id, 
            username: super_admin.username, 
            type: super_admin.type, 
            role: 'super-admin'}, 
            JWT_Secret, { expiresIn: '1h' });

        // Send the token in the response after successful login
        res.status(200).json({ message: 'Login successful', token });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Cartella 
// add cartella route
// TODO authorize partnership
// router.post('/add-cartella', async (req: Request, res: any) => {
//     const token = req.headers.authorization;

//     if(!token){
//         return res.status(401).json({ message: 'No token, authorization denied' });
//     }
    
//     const decoded: any = jwtDecode(token);
//     const partnershipId = decoded.partnership_id;
//     try {
//       const { cartellaNumber, cells, branchName } = req.body;
  
//       // Basic validation
//       if (!cartellaNumber || !Array.isArray(cells) || cells.length !== 5 || !partnershipId || !branchName) {
//         return res.status(400).json({ message: 'Invalid request data' });
//       }
  
//       // Check for grid size (5x5) and center cell
//       if (cells[2][2] !== 'Free') {
//         cells[2][2] = 'Free'; // Set the center cell to 'Free' if not already
//       }
  
//       // Create the new cartella
//       const newCartella = new Cartella({
//         cartellaNumber,
//         cells,
//         partnershipId,
//         branchName,
//       });
  
//       // Save the cartella to the database
//       await newCartella.save();
  
//       return res.status(201).json({
//         message: 'Cartella created successfully',
//         cartella: newCartella,
//       });
//     } catch (error) {
//       console.error('Error adding cartella:', error);
//       return res.status(500).json({ message: 'Server error', error });
//     }
// });

router.post('/add-cartella',authorize_partnership, async (req: Request, res: any) => {
    const token = req.headers.authorization;

    if(!token){
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded: any = jwtDecode(token);
    const partnershipId = decoded.partnership_id;
    
    try {
        const { cartellaNumber, cells, branchName } = req.body;
    
        // Basic validation
        if (!cartellaNumber || !Array.isArray(cells) || cells.length !== 5 || !partnershipId || !branchName) {
            return res.status(400).json({ message: 'Invalid request data' });
        }
    
        // Check for grid size (5x5) and center cell
        if (cells[2][2] !== 'Free') {
            cells[2][2] = 'Free'; // Set the center cell to 'Free' if not already
        }
    
        // Create the new Cartella (pre-save middleware will trigger here to populate cellsHash)
        const newCartella = new Cartella({
            cartellaNumber,
            cells,
            partnershipId,
            branchName,
        });
    
        // Save the cartella to the database
        await newCartella.save(); // This will trigger the pre-save middleware
    
        return res.status(201).json({
            message: 'Cartella created successfully',
            cartella: newCartella,
        });
    
    } catch (error) {
        console.error('Error adding cartella:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
});


// edit cartella
// router.post('/edit-cartella', async (req: Request, res: any) => {
//     const token = req.headers.authorization;

//     if(!token){
//         return res.status(401).json({ message: 'No token, authorization denied' });
//     }
    
//     const decoded: any = jwtDecode(token);
//     const partnershipId = decoded.partnership_id;

//     try {
//       const { cartellaNumber, branchName, cells } = req.body;
  
//       // Basic validation for cartellaNumber, branchName, and cells
//       if (!cartellaNumber || !branchName || !Array.isArray(cells) || cells.length !== 5) {
//         return res.status(400).json({ message: 'Invalid request data' });
//       }
  
//       // Ensure that the cells array is a 5x5 grid
//       for (let row of cells) {
//         if (row.length !== 5) {
//           return res.status(400).json({ message: 'Cells must be a 5x5 grid' });
//         }
//       }
  
//       // Ensure the center cell is 'Free'
//       if (cells[2][2] !== 'Free') {
//         cells[2][2] = 'Free';
//       }
  
//       // Find the cartella by pid, cartellaNumber and branchName, and update the cells
//       const updatedCartella = await Cartella.findOneAndUpdate(
//         { partnershipId, cartellaNumber, branchName},
//         { cells },
//         { new: true } // This option returns the updated document
//       );
  
//       // If no cartella is found, return a 404 response
//       if (!updatedCartella) {
//         return res.status(404).json({ message: 'Cartella not found' });
//       }
  
//       // Return the updated cartella
//       return res.status(200).json({
//         message: 'Cartella updated successfully',
//         cartella: updatedCartella,
//       });
//     } catch (error) {
//       console.error('Error updating cartella:', error);
//       return res.status(500).json({ message: 'Server error', error });
//     }
// });

router.post('/edit-cartella',authorize_partnership, async (req: Request, res: any) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded: any = jwtDecode(token);
    const partnershipId = decoded.partnership_id;

    try {
        const { cartellaNumber, branchName, cells } = req.body;

        // Basic validation for cartellaNumber, branchName, and cells
        if (!cartellaNumber || !branchName || !Array.isArray(cells) || cells.length !== 5) {
            return res.status(400).json({ message: 'Invalid request data' });
        }

        // Ensure that the cells array is a 5x5 grid
        for (let row of cells) {
            if (row.length !== 5) {
                return res.status(400).json({ message: 'Cells must be a 5x5 grid' });
            }
        }

        // Ensure the center cell is 'Free'
        if (cells[2][2] !== 'Free') {
            cells[2][2] = 'Free';
        }

        // Find the cartella by partnershipId, cartellaNumber, and branchName
        const cartella = await Cartella.findOne({ partnershipId, cartellaNumber, branchName });
        
        // If no cartella is found, return a 404 response
        if (!cartella) {
            return res.status(404).json({ message: 'Cartella not found' });
        }

        // Update the cartella's cells
        cartella.cells = cells;

        // Save the cartella to trigger the pre-save middleware (which will update cellsHash)
        await cartella.save();

        // Return the updated cartella
        return res.status(200).json({
            message: 'Cartella updated successfully',
            cartella,
        });

    } catch (error) {
        console.error('Error updating cartella:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
});


router.get('/drop-all-cartella',authorize_partnership, async (req: Request, res: Response) => {
    try {
        await Cartella.deleteMany(); // This will delete all documents in the Cartella collection
        res.status(200).json({ message: 'All cartellas deleted successfully.' });
    } catch (error) {
        console.error('Error deleting cartellas:', error);
        res.status(500).json({ message: 'Failed to delete cartellas.' });
    }
});


// delete cartella
router.post('/delete-cartella',authorize_partnership, async (req: Request, res: any) => {
    const token = req.headers.authorization;

    if(!token){
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded: any = jwtDecode(token);
    const partnershipId = decoded.partnership_id;

    try {
      const {branchName, cartellaId } = req.body;
  
      // Basic validation
      if (!partnershipId || !branchName || !cartellaId) {
        return res.status(400).json({ message: 'Missing required fields: partnershipId, branchName, cartellaId' });
      }
  
      // Find and delete the cartella by partnershipId, branchName, and cartellaId
      const deletedCartella = await Cartella.findOneAndDelete({
        _id: cartellaId,
        partnershipId,
        branchName
      });
  
      // If no cartella is found, return a 404 response
      if (!deletedCartella) {
        return res.status(404).json({ message: 'Cartella not found' });
      }
  
      // Return success message if deletion was successful
      return res.status(200).json({
        message: 'Cartella deleted successfully',
        cartella: deletedCartella
      });
    } catch (error) {
      console.error('Error deleting cartella:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
});

// TODO change post request to get and uncomment token
router.get('/cartella-list', async (req: Request, res: any) => {
    const token = req.headers.authorization;

    if(!token){
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded: any = jwtDecode(token);
    const partnershipId = decoded.partnership_id;

    // const {partnershipId} = req.body;

    try {
      // Retrieve all cartellas from the database
      const cartellas = await Cartella.find({partnershipId});
  
      // Return the list of cartellas
      return res.status(200).json({
        message: 'Cartellas retrieved successfully',
        cartellas,
      });
    } catch (error) {
      console.error('Error retrieving cartellas:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
});

router.post('/cartella-cell', async (req: Request, res: any) => {
    const token = req.headers.authorization;

    if(!token){
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded: any = jwtDecode(token);
    const partnershipId = decoded.caller_owner;
    const branchName = decoded.branch;
    const {cartellaNumber} = req.body;


    try {
      // Retrieve all cartella
      const cartellas = await Cartella.findOne({partnershipId, branchName, cartellaNumber});
      const cartella = cartellas?.cells;
      // Return the cartella cell
      return res.status(200).json({
        message: 'Cartella retrieved successfully',
        cartella,
      });
    } catch (error) {
      console.error('Error retrieving cartellas:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
});

router.post('/get-branch-name', async (req: Request, res: any) => {

    const {partnershipId} = req.body;

    try {
      const callers = await CallerModel.find({owner: partnershipId});
      // Return the cartella cell
      return res.status(200).json({
        message: 'callers retrieved successfully',
        callers,
      });
    } catch (error) {
      console.error('Error retrieving cartellas:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
});


// for select_cartella page
router.get('/cartella-numbers', async (req: Request, res: any) => {
    const token = req.headers.authorization;

    if(!token){
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded: any = jwtDecode(token);
    const partnershipId = decoded.caller_owner;
    const branchName = decoded.branch;


    // const {partnershipId, branchName} = req.body;

    try {
    //   const cartella_numbers = await Cartella.find({partnershipId, branchName});
    const cartella_numbers = await Cartella.find({partnershipId, branchName}).select('cartellaNumber');

    const cartellaNumberArray = cartella_numbers.map(item => item.cartellaNumber);

      // Return the cartella cell
      return res.status(200).json({
        message: 'callers retrieved successfully',
        cartellaNumberArray,
      });
    } catch (error) {
      console.error('Error retrieving cartellas:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
});


router.get('/packages-list', async (req: Request, res: any) => {
    const token = req.headers.authorization;

    if(!token){
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded: any = jwtDecode(token);
    const partnershipId = decoded.caller_owner;

    try {
        // Find the user packages based on the user ID
        const userPackages = await UserPackageModel.findOne({ user_id: partnershipId }).populate('packages.package');

        // If the user has no packages
        if (!userPackages) {
            return res.status(404).json({ message: 'No packages found for this user' });
        }

        // Format the response to include the package name and balance
        const formattedPackages = userPackages.packages.map(pkg => ({
            packageName: (pkg.package as any).packageName,
            balance: pkg.balance,
        }));

        // Return the formatted packages directly as an array (no wrapping with 'formattedPackages')
        return res.status(200).json(formattedPackages);
    } catch (error) {
        console.error('Error fetching packages:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;



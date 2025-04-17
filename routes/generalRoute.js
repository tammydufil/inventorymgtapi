const {
  createCategory,
  getAllCategories,
  getActiveCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoriescontoller");
const {
  getAllMaterials,
  getMaterialById,
  addMaterial,
  updateMaterial,
  deleteMaterial,
  getPurchaseHistory,
  getMaterialStats,
  getLowAndOutOfStockItems,
  getLastFivePurchases,
} = require("../controllers/materialController");
const {
  getAllProductTypes,
  getActiveProductTypes,
  getProductTypeById,
  deleteProductType,
  addProductType,
  updateProductType,
} = require("../controllers/productTypes");
const {
  getAllPurchases,
  createPurchases,
  getUserModulesByEmail,
} = require("../controllers/purchasecontroller");
const {
  createRequisition,
  getPendingApprovals,
  approveOrRejectRequest,
  getApprovalsByDateRange,
  getAllApprovalsByDateRange,
  getMyApprovalsByDateRange,
} = require("../controllers/requisitioncontroller");

const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  getApprovallist,
} = require("../controllers/usercontroller");
const router = require("express").Router();

router.get("/getMaterialStats", getMaterialStats);
router.get("/getLowAndOutOfStockItems", getLowAndOutOfStockItems);
router.get("/getLastFivePurchases", getLastFivePurchases);

router.post("/loginUser", loginUser);
router.post("/getUserModulesByEmail", getUserModulesByEmail);
router.post("/createUser", createUser);
router.get("/getAllUsers", getAllUsers);
router.get("/getApprovallist", getApprovallist);
router.get("/getUserById/:userId", getUserById);
router.post("/updateUser/:userId", updateUser);
router.delete("/deleteUser/:userId", deleteUser);

// User Routes End

// Product Route
router.get("/producttypes", getAllProductTypes);
router.get("/producttypes/active", getActiveProductTypes);
router.get("/producttypes/:id", getProductTypeById);
router.delete("/producttypes/:id", deleteProductType);
router.post("/producttypes", addProductType);
router.put("/producttypes/:id", updateProductType);

router.get("/categories", getAllCategories);
router.get("/categories/active", getActiveCategories);
router.get("/categories/:id", getCategoryById);
router.post("/categories", addCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

router.get("/materials", getAllMaterials);
router.get("/materials/:id", getMaterialById);
router.post("/materials", addMaterial);
router.put("/materials", updateMaterial);
router.delete("/materials/:id", deleteMaterial);

// Product Route End

// purchase Route end
router.get("/getAllPurchases", getAllPurchases);
router.post("/createPurchases", createPurchases);
router.get("/purchase-history/:materialId", getPurchaseHistory);

// purchase Route end

// Requisiton start

router.post("/createRequisition", createRequisition);
router.post("/getPendingApprovals", getPendingApprovals);
router.post("/approveOrRejectRequest", approveOrRejectRequest);
router.post("/getApprovalsByDateRange", getApprovalsByDateRange);
router.post("/getAllApprovalsByDateRange", getAllApprovalsByDateRange);
router.post("/getMyApprovalsByDateRange", getMyApprovalsByDateRange);

// Requisiton end

module.exports = router;

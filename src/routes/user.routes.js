import { Router } from "express";
import { veryfyJWT } from "../middlewares/auth.middleware.js";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshaccesstoken,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secure routes can be added here in future
router.route("/logout").post(veryfyJWT, logoutUser);
router.route("/change-password").post(veryfyJWT, changepasswaord);
router.route("/refresh-token").post(refreshaccesstoken);
router.route("/current-user").get(veryfyJWT, getcurrrentuser);
router.route("/update-account").put(veryfyJWT, updateAccountdetails);
router
  .route("/update-avatar")
  .put(veryfyJWT, upload.single("avatar"), updateuseravatar);

export default router;

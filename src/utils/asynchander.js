// const asynchander = (fun) => async (req, res, next) => {
//   try {
//     await fun(req, res, next);
//   } catch (error) {
//     res.status(err.code || 500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

const asynchander = (fun) => {
  return (req, res, next) => {
    Promise.resolve(fun(req, res, next)).catch((error) => {
      next(error);
    });
  };
};
export { asynchander };

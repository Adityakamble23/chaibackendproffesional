const asynchander = (fun) => async (req, res, next) => {
  try {
    await fun(req, res, next);
  } catch (error) {
    res.status(err.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export { asynchander };

// const asynchander2 = (fun) => {
//   (req, res, next) => {
//     Promise.resolve(fun(req, res, next)).catch((error) => {
//       next(error);
//     });
//   };
// };

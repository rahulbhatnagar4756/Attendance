module.exports = (io) => {
  const handleTimeActions = function (payload) {
    io.emit(payload);
  };
  return {
    handleTimeActions,
  };
};

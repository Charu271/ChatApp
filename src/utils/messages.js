const messageGenerator = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime(),
  };
};

const locationMessageGenerator = (username, url) => {
  return {
    username,
    url,
    createdAt: new Date().getTime(),
  };
};
module.exports = {
  messageGenerator,
  locationMessageGenerator,
};

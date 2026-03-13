const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Get the token from the request header
  const authHeader = req.header('Authorization');

  // 2. Check if there is no token, or if it doesn't start with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No valid token provided.' });
  }

  // 3. Extract just the token string (remove the "Bearer " part)
  const token = authHeader.split(' ')[1];

  // 4. Verify the token using our secret key
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Attach the user ID from the token to the request object
    req.user = decoded.user; 
    
    // 6. Tell Express to move on to the actual route (let them into the club!)
    next(); 
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
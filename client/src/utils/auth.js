export function getUserFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;
  
    try {
      const cleanToken = token.replace(/^"|"$/g, "").trim();
      const parts = cleanToken.split(".");
      if (parts.length !== 3) return null;
  
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (err) {
      console.error("Failed to parse token:", err, token);
      return null;
    }
  }
  
  export function getToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return token.replace(/^"|"$/g, "").trim();
  }  
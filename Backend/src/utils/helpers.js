const generateCode = () => {
  let code = '';
  const possible = '0123456789';
  for (var i = 0; i < 6; i++) {
    code += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return code;
};

const decodeHtmlEntities = (text) => {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
};

const stripHtmlTags = (html) => {
  if (!html) return "";
  // Decode HTML entities first
  const decodedHtml = decodeHtmlEntities(html);
  // Remove HTML tags
  return decodedHtml
    .replace(/<\/?[^>]+(>|$)/g, "") // Remove all HTML tags
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();
};

module.exports = {
  generateCode,
  stripHtmlTags
};

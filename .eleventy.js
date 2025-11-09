const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {

  // Perintah untuk menyalin folder assets dan admin ke folder output
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("admin");

  // Filter untuk memformat tanggal di halaman artikel
  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'Asia/Jakarta' }).setLocale('id').toLocaleString(DateTime.DATE_FULL);
  });

  // FILTER BARU UNTUK SITEMAP
  eleventyConfig.addFilter("sitemapDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toISODate(); // Format YYYY-MM-DD
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site"
    },
    passthroughFileCopy: true,
    templateFormats: ["md", "njk", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // 1. Grab 'orderNumber' from the query string
  const orderNumber = event.queryStringParameters.orderNumber;

  if (!orderNumber) {
    return {
      statusCode: 400,
      body: JSON.stringify({ valid: false, message: "No orderNumber provided" }),
    };
  }

  // 2. Prepare your Shopify Admin API credentials
  const shopifyStore = "6re6d7-sg.myshopify.com"; // e.g., "cool-store.myshopify.com"
  const adminApiToken = process.env.SHOPIFY_ADMIN_TOKEN; // we'll set this in Netlify environment variables

  // 3. Build the request to Shopify
  // We'll query orders by name. If you use numeric ID, you need a different approach. 
  // Typically the "name" is like "#1001" or "1001" depending on your store settings.
  // We'll do a search for the "name" field:
  const url = `https://${shopifyStore}/admin/api/2023-07/orders.json?name=${encodeURIComponent(orderNumber)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': adminApiToken,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    // 4. Check if we found any orders
    // The 'orders' array will be empty if no match
    if (data.orders && data.orders.length > 0) {
      // found a matching order
      return {
        statusCode: 200,
        body: JSON.stringify({ valid: true }),
      };
    } else {
      // no matching order
      return {
        statusCode: 200,
        body: JSON.stringify({ valid: false }),
      };
    }
  } catch (err) {
    console.error("Error fetching order:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ valid: false, error: err.message }),
    };
  }
};

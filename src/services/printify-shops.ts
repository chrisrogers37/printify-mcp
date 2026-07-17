/**
 * Printify shops service for Printify MCP
 */
import { PrintifyAPI } from '../printify-api.js';
import { formatErrorResponse, formatSuccessResponse } from '../utils/error-handler.js';

/**
 * Get Printify status
 */
export async function getPrintifyStatus(printifyClient: PrintifyAPI) {
  try {
    // Validate client is initialized
    if (!printifyClient) {
      throw new Error('Printify API client is not initialized. The PRINTIFY_API_KEY environment variable may not be set.');
    }
    
    // A status check must report reality, not throw: attempt a real call and
    // derive Connected from its actual outcome.
    let shops: any[] = [];
    let connectionError: unknown = null;
    try {
      shops = await printifyClient.getShops();
    } catch (error) {
      connectionError = error;
    }
    const connected = printifyClient.isConnected();
    const currentShop = printifyClient.getCurrentShop();
    
    return {
      success: true,
      shops,
      currentShop,
      response: {
        content: [{
          type: "text",
          text: `Printify API Status:\n\n` +
                `Connected: ${connected ? 'Yes' : 'No'}\n` +
                (connected
                  ? `Available Shops: ${shops.length}\n` +
                    `Current Shop: ${currentShop ? `${currentShop.title} (ID: ${currentShop.id})` : 'None'}`
                  : `Reason: ${connectionError instanceof Error ? connectionError.message : 'the Printify API could not be reached'}`)
        }]
      }
    };
  } catch (error: any) {
    console.error('Error getting Printify status:', error);
    
    return {
      success: false,
      error,
      errorResponse: formatErrorResponse(
        error,
        'Get Printify Status',
        {},
        [
          'Check that your Printify API key is valid',
          'Ensure your Printify account is properly connected'
        ]
      )
    };
  }
}

/**
 * List Printify shops
 */
export async function listPrintifyShops(printifyClient: PrintifyAPI) {
  try {
    // Validate client is initialized
    if (!printifyClient) {
      throw new Error('Printify API client is not initialized. The PRINTIFY_API_KEY environment variable may not be set.');
    }
    
    // Get shops and current shop ID
    const shops = await printifyClient.getShops();
    const currentShopId = printifyClient.getCurrentShopId();
    
    if (shops.length === 0) {
      return {
        success: true,
        shops: [],
        response: {
          content: [{
            type: "text",
            text: "No shops found in your Printify account."
          }]
        }
      };
    }
    
    // Format shops for display
    const shopsText = shops.map((shop: any) => {
      const isCurrent = shop.id.toString() === currentShopId;
      return `${isCurrent ? '→ ' : '  '}${shop.title} (ID: ${shop.id}, Channel: ${shop.sales_channel})`;
    }).join('\n');
    
    return {
      success: true,
      shops,
      currentShopId,
      response: {
        content: [{
          type: "text",
          text: `Available Printify Shops:\n\n${shopsText}`
        }]
      }
    };
  } catch (error: any) {
    console.error('Error listing Printify shops:', error);
    
    return {
      success: false,
      error,
      errorResponse: formatErrorResponse(
        error,
        'List Printify Shops',
        {},
        [
          'Check that your Printify API key is valid',
          'Ensure your Printify account is properly connected'
        ]
      )
    };
  }
}

/**
 * Switch Printify shop
 */
export async function switchPrintifyShop(printifyClient: PrintifyAPI, shopId: string) {
  try {
    // Validate client is initialized
    if (!printifyClient) {
      throw new Error('Printify API client is not initialized. The PRINTIFY_API_KEY environment variable may not be set.');
    }
    
    // Get shops and find the requested shop
    const shops = await printifyClient.getShops();
    const shop = shops.find((s: any) => s.id.toString() === shopId);
    
    if (!shop) {
      throw new Error(`Shop with ID ${shopId} not found. Use the list-shops tool to see available shops.`);
    }
    
    // Switch to the requested shop
    printifyClient.setShopId(shopId);
    
    return {
      success: true,
      shop,
      response: {
        content: [{
          type: "text",
          text: `Switched to shop: ${shop.title} (ID: ${shop.id}, Channel: ${shop.sales_channel})`
        }]
      }
    };
  } catch (error: any) {
    console.error('Error switching Printify shop:', error);
    
    return {
      success: false,
      error,
      errorResponse: formatErrorResponse(
        error,
        'Switch Printify Shop',
        {
          ShopId: shopId
        },
        [
          'Check that the shop ID is valid',
          'Use the list-shops tool to see available shops',
          'Ensure your Printify account is properly connected'
        ]
      )
    };
  }
}

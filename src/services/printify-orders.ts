import { PrintifyAPI } from '../printify-api.js';
import { formatErrorResponse, formatSuccessResponse } from '../utils/error-handler.js';

/**
 * List orders from Printify
 */
export async function listOrders(printifyClient: PrintifyAPI, options: { page?: number; limit?: number; status?: string; sku?: string } = {}) {
  try {
    const currentShop = printifyClient.getCurrentShop();
    if (!currentShop) {
      throw new Error('No shop is currently selected. Use the list-shops and switch-shop tools to select a shop.');
    }

    // Printify API caps limit at 10 per page
    const sanitizedOptions = {
      ...options,
      limit: Math.min(options.limit || 10, 10)
    };

    const orders = await printifyClient.getOrders(sanitizedOptions);

    return {
      success: true,
      orders,
      response: formatSuccessResponse('Orders Retrieved Successfully', {
        Count: orders?.data?.length ?? 0,
        Page: sanitizedOptions.page || 1,
        Limit: sanitizedOptions.limit,
        Status: sanitizedOptions.status || 'all',
        Shop: currentShop
      })
    };
  } catch (error) {
    console.error('Error listing orders:', error);
    return {
      success: false,
      error,
      errorResponse: formatErrorResponse(error as Error, 'List Orders', {
        Shop: printifyClient.getCurrentShop(),
        Options: options
      }, [
        'Check that your Printify API key is valid',
        'Ensure your Printify account is properly connected',
        'Make sure you have selected a shop'
      ])
    };
  }
}

/**
 * Get a specific order from Printify
 */
export async function getOrder(printifyClient: PrintifyAPI, orderId: string) {
  try {
    const currentShop = printifyClient.getCurrentShop();
    if (!currentShop) {
      throw new Error('No shop is currently selected. Use the list-shops and switch-shop tools to select a shop.');
    }

    const order = await printifyClient.getOrder(orderId);

    return {
      success: true,
      order,
      response: formatSuccessResponse('Order Retrieved Successfully', {
        OrderId: orderId,
        Status: order?.status,
        Shop: currentShop
      })
    };
  } catch (error) {
    console.error('Error getting order:', error);
    return {
      success: false,
      error,
      errorResponse: formatErrorResponse(error as Error, 'Get Order', {
        OrderId: orderId,
        Shop: printifyClient.getCurrentShop()
      }, [
        'Check that the order ID is valid',
        'Ensure your Printify account is properly connected',
        'Make sure you have selected a shop'
      ])
    };
  }
}

/**
 * Send an order to production
 */
export async function sendToProduction(printifyClient: PrintifyAPI, orderId: string) {
  try {
    const currentShop = printifyClient.getCurrentShop();
    if (!currentShop) {
      throw new Error('No shop is currently selected. Use the list-shops and switch-shop tools to select a shop.');
    }

    const result = await printifyClient.sendOrderToProduction(orderId);

    return {
      success: true,
      result,
      response: formatSuccessResponse('Order Sent to Production', {
        OrderId: orderId,
        Shop: currentShop
      })
    };
  } catch (error) {
    console.error('Error sending order to production:', error);
    return {
      success: false,
      error,
      errorResponse: formatErrorResponse(error as Error, 'Send to Production', {
        OrderId: orderId,
        Shop: printifyClient.getCurrentShop()
      }, [
        'Check that the order ID is valid',
        'Ensure the order is in a state that can be sent to production',
        'Make sure you have selected a shop'
      ])
    };
  }
}

/**
 * Calculate shipping for an order
 */
export async function calculateShipping(printifyClient: PrintifyAPI, shippingData: any) {
  try {
    const currentShop = printifyClient.getCurrentShop();
    if (!currentShop) {
      throw new Error('No shop is currently selected. Use the list-shops and switch-shop tools to select a shop.');
    }

    const result = await printifyClient.calculateShipping(shippingData);

    return {
      success: true,
      result,
      response: formatSuccessResponse('Shipping Calculated Successfully', {
        Shop: currentShop
      })
    };
  } catch (error) {
    console.error('Error calculating shipping:', error);
    return {
      success: false,
      error,
      errorResponse: formatErrorResponse(error as Error, 'Calculate Shipping', {
        Shop: printifyClient.getCurrentShop()
      }, [
        'Check that the shipping data is valid',
        'Ensure line items and address are provided',
        'Make sure you have selected a shop'
      ])
    };
  }
}

/**
 * Submit a new order
 */
export async function submitOrder(printifyClient: PrintifyAPI, orderData: any) {
  try {
    const currentShop = printifyClient.getCurrentShop();
    if (!currentShop) {
      throw new Error('No shop is currently selected. Use the list-shops and switch-shop tools to select a shop.');
    }

    const result = await printifyClient.submitOrder(orderData);

    return {
      success: true,
      result,
      response: formatSuccessResponse('Order Submitted Successfully', {
        OrderId: result?.id,
        Shop: currentShop
      })
    };
  } catch (error) {
    console.error('Error submitting order:', error);
    return {
      success: false,
      error,
      errorResponse: formatErrorResponse(error as Error, 'Submit Order', {
        Shop: printifyClient.getCurrentShop()
      }, [
        'Check that the order data is valid',
        'Ensure line_items include valid product_id, variant_id, and quantity',
        'Ensure address_to includes all required fields',
        'Make sure you have selected a shop'
      ])
    };
  }
}

/**
 * Cancel an order (only orders with status on-hold or payment-not-received)
 */
export async function cancelOrder(printifyClient: PrintifyAPI, orderId: string) {
  try {
    const currentShop = printifyClient.getCurrentShop();
    if (!currentShop) {
      throw new Error('No shop is currently selected. Use the list-shops and switch-shop tools to select a shop.');
    }

    const result = await printifyClient.cancelOrder(orderId);

    return {
      success: true,
      result,
      response: formatSuccessResponse('Order Cancelled Successfully', {
        OrderId: orderId,
        Shop: currentShop
      })
    };
  } catch (error) {
    console.error('Error cancelling order:', error);
    return {
      success: false,
      error,
      errorResponse: formatErrorResponse(error as Error, 'Cancel Order', {
        OrderId: orderId,
        Shop: printifyClient.getCurrentShop()
      }, [
        'Check that the order ID is valid',
        'Only orders with status on-hold or payment-not-received can be cancelled',
        'Make sure you have selected a shop'
      ])
    };
  }
}

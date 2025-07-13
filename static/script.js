itemPriceInput.value = itemToEdit.price; 
        editingItemId = id; 
        saveItemBtn.textContent = 'Update Item'; 
        itemIdInput.setAttribute('readonly', 'true'); // Make ID read-only during edit 
        showScreen('addItemScreen'); // Switch to add item screen 
        itemNameInput.focus(); // Focus on the name input for quick editing 
        showMessage(`Editing item: ${itemToEdit.name}`, 'info'); 
    } 
} 
 
/** 
 * Deletes an item from the inventory. 
 * @param {string} id - The ID of the item to delete. 
 */ 
function deleteItem(id) { 
    const ini alLength = inventory.length; 
    const deletedItem = inventory.find(item => item.id === id); 
    inventory = inventory.filter(item => item.id !== id); 
    if (inventory.length < ini alLength) { 
        showMessage(`Item "${deletedItem ? deletedItem.name : id}" deleted successfully!`, 
'success'); 
    } else { 
        showMessage('Item not found!', 'error'); 
    } 
    saveState(); 
    renderInventory(); // Re-render the full inventory 
    updateInventoryMetrics(); // Update metrics 
    populateModifyItemSelect(); // Update dropdown 
    clearForm(); // Clear the form if the deleted item was being edited 
} 
 
/** 
 * Filters inventory items based on search input on the Inventory View screen. 
 */ 
inventorySearchBar.addEventListener('input', function() { 
    const searchTerm = inventorySearchBar.value.toLowerCase().trim(); 
    const filteredItems = inventory.filter(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        item.id.toLowerCase().includes(searchTerm) 
    ); 
    renderInventory(filteredItems); 
}); 
 
/** 
 * Toggles the visibility of the sale price input based on the selected reason. 
 */ 
function toggleSalePriceInput() { 
    if (reasonSaleRadio.checked) { 
        salePriceContainer.classList.remove('hidden'); 
        salePriceInput.seAttribute('required', 'true'); 
        // Set default sale price to item's cost price when selected item changes 
        const selectedItem = inventory.find(item => item.id === modifyItemIdSelect.value); 
        if (selectedItem) { 
            salePriceInput.value = selectedItem.price.toFixed(2); 
        } else { 
            salePriceInput.value = ''; 
        } 
    } else { 
        salePriceContainer.classList.add('hidden'); 
        salePriceInput.removeAttribute('required'); 
        salePriceInput.value = ''; 
    } 
} 
 
// Event listeners for reason radio buttons 
reasonSaleRadio.addEventListener('change', toggleSalePriceInput); 
reasonDamageRadio.addEventListener('change', toggleSalePriceInput); 
 
// Event listener for item selection change to update default sale price 
modifyItemIdSelect.addEventListener('change', toggleSalePriceInput); 
 
 
/** 
 * Handles the submission of the stock modification form. 
 * @param {Event} event - The form submission event. 
 */ 
stockModificationForm.addEventListener('submit', function(event) { 
    event.preventDefault(); 
 
    const selectedItemId = modifyItemIdSelect.value; 
    const quantityChange = parseInt(modifyQuantityInput.value); 
    const changeReason = 
document.querySelector('input[name="changeReason"]:checked').value; 
    const salePrice = parseFloat(salePriceInput.value); 
 
    if (!selectedItemId) { 
        showMessage('Please select an item.', 'error'); 
        return; 
    } 
    if (isNaN(quantityChange) || quantityChange <= 0) { 
        showMessage('Please enter a valid positive quantity.', 'error'); 
        return; 
    } 
    if (changeReason === 'sale' && (isNaN(salePrice) || salePrice < 0)) { 
        showMessage('Please enter a valid sale price.', 'error'); 
        return; 
    } 
 
 
    const itemToModify = inventory.find(item => item.id === selectedItemId); 
 
    if (!itemToModify) { 
        showMessage('Selected item not found.', 'error'); 
        return; 
    } 
 
    if (quantityChange > itemToModify.quantity) { 
        showMessage('Cannot change more than available quantity.', 'error'); 
        return; 
    } 
 
    // Perform stock modification 
    itemToModify.quantity -= quantityChange; 
 
    if (changeReason === 'sale') { 
        // Profit/Loss = (Sale Price - Cost Price) * Quantity 
        const itemCostPrice = itemToModify.price; 
        const profitLossPerUnit = salePrice - itemCostPrice; 
        const transactionProfitLoss = profitLossPerUnit * quantityChange; 
 
        if (transactionProfitLoss >= 0) { 
            totalProfit += transactionProfitLoss; 
            showMessage(`Sold ${quantityChange} of ${itemToModify.name} for 
₹${salePrice.toFixed(2)} each. Profit: ₹${transactionProfitLoss.toFixed(2)}`, 'success'); 
        } else { 
            totalLoss += Math.abs(transactionProfitLoss); 
            showMessage(`Sold ${quantityChange} of ${itemToModify.name} for 
₹${salePrice.toFixed(2)} each. Loss: ₹${Math.abs(transactionProfitLoss).toFixed(2)}`, 'info'); 
        } 
 
    } else if (changeReason === 'damage') { 
        totalLoss += (quantityChange * itemToModify.price); // Loss is based on cost price 
        showMessage(`Logged ${quantityChange} of ${itemToModify.name} as damaged. Loss: 
₹${(quantityChange * itemToModify.price).toFixed(2)}`, 'info'); 
    } 
 
    // Remove item if quantity drops to 0 or below 
    if (itemToModify.quantity <= 0) { 
        inventory = inventory.filter(item => item.id !== selectedItemId); 
        showMessage(`${itemToModify.name} quan ty reached zero and was removed from 
inventory.`, 'info'); 
    } 
 
    saveState(); 
populateModifyItemSelect(); // Re-populate dropdown to reflect new quantities or 
removed items 
updateFinancialSummary(); // Update profit/loss display 
updateInventoryMetrics(); // Update overall inventory metrics 
renderInventory(); // Re-render inventory table if active 
modifyQuantityInput.value = ''; // Clear the quantity input a er successful modification 
salePriceInput.value = ''; // Clear sale price input 
}); 
// Ini al load and render when the page loads 
document.addEventListener('DOMContentLoaded', () => { 
loadState(); 
showScreen('addItemScreen'); // Show the Add Item screen by default 
});

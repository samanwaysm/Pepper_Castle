$(document).ready(function () {
    updateCartCount();
});
function updateCartCount() {
    const userId = `<%= JSON.stringify(userId) %>`;  // Make sure userId is defined here
    if (!userId) {
        console.error("userId is not defined!");
        return;
    }

    $.ajax({
        url: '/api/itemCount',
        method: 'GET',
        data: { userId: userId },
        success: function (response) {
            console.log("Cart Count Response:", response);
            cartCountDisplay(response.cartItemCount);  // Pass the cart item count directly
        },
        error: function () {
            console.error("Error fetching cart count");
        }
    });
}

function cartCountDisplay(cartItemCount) {
    const cartIcon = document.getElementById('cartIcon');

    // Remove any existing counter to avoid duplication
    const existingCounter = cartIcon.querySelector('span');
    if (existingCounter) {
        cartIcon.removeChild(existingCounter);
    }

    // Create a new span element for the cart count
    const counter = document.createElement('span');
    counter.style.position = 'absolute';
    counter.style.borderRadius = '50%';
    counter.style.backgroundColor = 'var(--headings-color)';
    counter.style.width = '14px';
    counter.style.height = '14px';
    counter.style.top = '20px';
    // counter.style.right = '0'; 
    counter.style.textAlign = 'center';
    counter.style.lineHeight = '15px';
    counter.style.fontSize = '10px';
    counter.style.color = '#fff';
    counter.textContent = cartItemCount;  // Use the count returned from the server

    // Append the counter to the cart icon
    cartIcon.appendChild(counter);
}
function updateCartCount() {
    const userId = `<%= JSON.stringify(userId) %>`;  // Make sure userId is defined here
    if (!userId) {
        console.error("userId is not defined!");
        return;
    }

    $.ajax({
        url: '/api/itemCount',
        method: 'GET',
        data: { userId: userId },
        success: function (response) {
            console.log("Cart Count Response:", response);
            cartCountDisplay(response.cartItemCount);  // Pass the cart item count directly
        },
        error: function () {
            console.error("Error fetching cart count");
        }
    });
}
function cartCountDisplay(cartItemCount) {
    const cartIcon = document.getElementById('cartIcon');

    // Remove any existing counter to avoid duplication
    const existingCounter = cartIcon.querySelector('span');
    if (existingCounter) {
        cartIcon.removeChild(existingCounter);
    }

    // Create a new span element for the cart count
    const counter = document.createElement('span');
    counter.style.position = 'absolute';
    counter.style.borderRadius = '50%';
    counter.style.backgroundColor = 'var(--headings-color)';
    counter.style.width = '14px';
    counter.style.height = '14px';
    counter.style.top = '20px';
    // counter.style.right = '0'; 
    counter.style.textAlign = 'center';
    counter.style.lineHeight = '15px';
    counter.style.fontSize = '10px';
    counter.style.color = '#fff';
    counter.textContent = cartItemCount;  // Use the count returned from the server

    // Append the counter to the cart icon
    cartIcon.appendChild(counter);
}



//  // Sample address data
//  let addresses = [
//     {
//         name: "Home",
//         address: "Samanway S M, Krishna Thulasi, Electronic City, Bangalore, Kerala - 670691"
//     },
//     {
//         name: "Office",
//         address: "123 Tech Park, Industrial Area, Bangalore, Karnataka - 560076"
//     }
//     ];

// // Show modal to select addresses
// document.getElementById("changeAddressBtn").onclick = function() {
// document.getElementById("changeAddressModal").style.display = "flex";
// renderAddresses();
// }

// // Show modal to add new address
// document.getElementById("addAddressBtn").onclick = function() {
//     document.getElementById("addAddressModal").style.display = "flex";
// }

// // Close modals
// document.getElementById("closeModal").onclick = function() {
//     document.getElementById("changeAddressModal").style.display = "none";
// }
// document.getElementById("closeAddModal").onclick = function() {
//     document.getElementById("addAddressModal").style.display = "none";
// }

// // Close modals when clicking outside
// window.onclick = function(event) {
//     if (event.target === document.getElementById("changeAddressModal")) {
//         document.getElementById("changeAddressModal").style.display = "none";
//     }
//     if (event.target === document.getElementById("addAddressModal")) {
//         document.getElementById("addAddressModal").style.display = "none";
//     }
// }

// // Add address
// document.getElementById("saveAddressBtn").onclick = function() {
//     const username = document.getElementById("username").value;
//     const phone = document.getElementById("phone").value;
//     const street = document.getElementById("street").value;
//     const block = document.getElementById("block").value;
//     const unitnum = document.getElementById("unitnum").value;
//     const postal = document.getElementById("postal").value;

//     if (username && phone && street && block && unitnum && postal) {
//         addresses.push({
//             name: username,
//             phone: phone,
//             street: street,
//             block: block,
//             unitnum: unitnum,
//             postal: postal
//         });

//         document.getElementById("addAddressModal").style.display = "none";
//         renderAddresses();
//     } else {
//         alert("Please fill all fields.");
//     }
// }

// // Render the address list with radio buttons, edit, and delete options
// function renderAddresses() {
//     const addressList = document.querySelector(".address-list");
//     addressList.innerHTML = '';
//     addresses.forEach((item, index) => {
//         addressList.innerHTML += `
//             <div class="address-item">
//                 <label>
//                     <input type="radio" name="selectedAddress" value="${index}">
//                     <strong>${item.name}</strong> (${item.phone})<br>
//                     ${item.street}, Block ${item.block}, Unit ${item.unitnum}, Postal Code: ${item.postal}
//                 </label>
//                 <div class="icons">
//                     <i class="fas fa-edit" data-index="${index}" title="Edit Address"></i>
//                     <i class="fas fa-trash-alt" data-index="${index}" title="Delete Address"></i>
//                 </div>
//             </div>
//         `;
//     });
// }

// // Edit and delete address functionality
// document.addEventListener("click", function(event) {
//     const target = event.target;
//     const index = target.getAttribute("data-index");

//     if (target.classList.contains("fa-edit")) {
//         const newAddress = prompt("Edit address:", JSON.stringify(addresses[index]));
//         if (newAddress) {
//             addresses[index] = JSON.parse(newAddress);
//             renderAddresses();
//         }
//     }

//     if (target.classList.contains("fa-trash-alt")) {
//         if (confirm("Are you sure you want to delete this address?")) {
//             addresses.splice(index, 1);
//             renderAddresses();
//         }
//     }
// });

// Get userId from the server-side template
const userId = `<%= JSON.stringify(userId) %>`; // Assuming this is passed from your backend

// Function to open modals
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

// Function to close modals
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Open the modal to change address and fetch addresses via AJAX
document.getElementById("changeAddressBtn").onclick = function () {
    openModal('changeAddressModal');
    fetchAddresses();
}

// Close modals on close button click
document.getElementById("closeModal").onclick = function () {
    closeModal('changeAddressModal');
}
document.getElementById("closeAddModal").onclick = function () {
    closeModal('addAddressModal');
}

// Fetch addresses using AJAX and render them
function fetchAddresses() {
    const addressList = document.getElementById("addressList");
    addressList.innerHTML = 'Loading...';            
    
    fetch(`/api/showAddress?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            console.log(data.isDefault);
            addressList.innerHTML = '';
            if (data.length === 0) {
                addressList.innerHTML = 'No addresses found.';
            } else {
                data.forEach((address, index) => {
                    addressList.innerHTML += `
                        <div class="address-item">
                            <label>
                                <input type="radio" name="selectedAddress" 
                                    value="${index}" 
                                    ${address.isDefault ? 'checked' : ''} 
                                    onchange="updateDefaultAddress('${address._id}')">                                        
                                <div>
                                    <span>${address.structuredAddress}</span>
                                </div>
                            </label>
                            <div class="icons">
                                <i class="fas fa-edit" onclick="editAddress(${index})" title="Edit Address"></i>
                                <i class="fas fa-trash-alt" onclick="deleteAddress(${index})" title="Delete Address"></i>
                            </div>
                        </div>

                    `;
                });
            }
        })
        .catch(error => console.error('Error fetching addresses:', error));
}

// Open modal to add a new address
document.getElementById("addAddressBtn").onclick = function () {
    openModal('addAddressModal');
}

// Save address using AJAX
document.getElementById("saveAddressBtn").onclick = function () {
    const username = document.getElementById("username").value;
    const phone = document.getElementById("phone").value;
    const street = document.getElementById("street").value;
    const block = document.getElementById("block").value;
    const unitnum = document.getElementById("unitnum").value;
    const postal = document.getElementById("postal").value;

    // Send the new address data via AJAX
    const data = { userId, username, phone, street, block, unitnum, postal }; // Include userId

fetch(`/api/addAddress?userId=${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            alert('Address added successfully!');
            closeModal('addAddressModal');
            fetchAddresses();  // Refresh address list
        })
        .catch(error => console.error('Error adding address:', error));
}

// Edit address function
function editAddress(index) {
    // Implement AJAX call to edit the address by index
    const newAddress = prompt('Edit address:'); // Get updated address details
    if (newAddress) {
        // Send an AJAX request to update the address
        fetch(`/api/editAddress`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, index, newAddress }) // Include userId
        })
            .then(response => response.json())
            .then(result => {
                alert('Address updated successfully!');
                fetchAddresses(); // Refresh address list
            })
            .catch(error => console.error('Error updating address:', error));
    }
}

// Delete address function
function deleteAddress(index) {
    // Implement AJAX call to delete the address by index
    if (confirm('Are you sure you want to delete this address?')) {
        fetch(`/api/deleteAddress`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, index }) // Include userId
        })
            .then(response => response.json())
            .then(result => {
                alert('Address deleted successfully!');
                fetchAddresses(); // Refresh address list
            })
            .catch(error => console.error('Error deleting address:', error));
    }
}

function updateDefaultAddress(addressId) {
    const userId = `<%= JSON.stringify(userId) %>`;
    console.log(addressId);
    $.ajax({
        type: 'POST',
        url: '/api/updateDefaultAddress',
        data: {
            userId: userId,
            addressId: addressId
        },
        success: function(response) {
            // Handle success response
            closeModal('changeAddressModal');
            fetchDefaultAddress();
            // console.log('Default address updated successfully:', response);
        },
        error: function(xhr, status, error) {
            // Handle error response
            console.error('Error updating default address:', error);
        }
    });
}

// Function to fetch and update the default address on the main page
function fetchDefaultAddress() {
    console.log('fch');
    
    const userId = `<%= JSON.stringify(userId) %>`;
    fetch(`/api/showDefaultAddress?userId=${userId}`)
        .then(response => response.json())
        .then(address => {
            document.getElementById('currentAddress').innerHTML = `
                <strong>${address.username}</strong><br>
                ${address.structuredAddress}
            `;
        });
}

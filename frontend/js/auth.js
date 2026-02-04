/**
 * Authentication Module for Lost & Found Portal
 * Handles login, signup, and session management
 * Restricts access to @rvce.edu.in email addresses only
 */

const ALLOWED_DOMAIN = '@rvce.edu.in';

// ========================================
// EMAIL VALIDATION
// ========================================

/**
 * Validate that email ends with @rvce.edu.in
 */
function validateRVCEEmail(email) {
    return email.toLowerCase().endsWith(ALLOWED_DOMAIN.toLowerCase());
}

/**
 * Show error message
 */
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('d-none');
    }
}

/**
 * Hide error message
 */
function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.classList.add('d-none');
    }
}

/**
 * Show success message
 */
function showSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.remove('d-none');
    }
}

// ========================================
// SIGNUP FUNCTIONALITY
// ========================================

const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupPasswordConfirm').value;
        const signupBtn = document.getElementById('signupBtn');

        // Hide previous messages
        hideError('signupError');
        hideError('signupSuccess');

        // Validate RVCE email
        if (!validateRVCEEmail(email)) {
            showError('signupError', `Email must end with ${ALLOWED_DOMAIN}`);
            return;
        }

        // Validate password match
        if (password !== confirmPassword) {
            showError('signupError', 'Passwords do not match');
            return;
        }

        // Validate password length
        if (password.length < 6) {
            showError('signupError', 'Password must be at least 6 characters');
            return;
        }

        // Disable button
        signupBtn.disabled = true;
        signupBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Creating Account...';

        try {
            // Create user with Firebase Auth
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            console.log('✅ User created:', userCredential.user.email);

            // Show success message
            showSuccess('signupSuccess', 'Account created successfully! Redirecting to login...');

            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error('❌ Signup error:', error);
            let errorMessage = 'Failed to create account. ';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage += 'This email is already registered.';
                    break;
                case 'auth/invalid-email':
                    errorMessage += 'Invalid email address.';
                    break;
                case 'auth/weak-password':
                    errorMessage += 'Password is too weak.';
                    break;
                default:
                    errorMessage += error.message;
            }

            showError('signupError', errorMessage);

            // Re-enable button
            signupBtn.disabled = false;
            signupBtn.innerHTML = '<i class="bi bi-person-plus"></i> Create Account';
        }
    });
}

// ========================================
// LOGIN FUNCTIONALITY
// ========================================

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const loginBtn = document.getElementById('loginBtn');

        // Hide previous errors
        hideError('loginError');

        // Validate RVCE email
        if (!validateRVCEEmail(email)) {
            showError('loginError', `Only ${ALLOWED_DOMAIN} emails are allowed`);
            return;
        }

        // Disable button
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Logging in...';

        try {
            // Sign in with Firebase Auth
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            console.log('✅ User logged in:', userCredential.user.email);

            // Redirect to main portal
            window.location.href = 'index.html';

        } catch (error) {
            console.error('❌ Login error:', error);
            let errorMessage = 'Login failed. ';

            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage += 'No account found with this email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage += 'Incorrect password.';
                    break;
                case 'auth/invalid-email':
                    errorMessage += 'Invalid email address.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage += 'Too many failed attempts. Try again later.';
                    break;
                default:
                    errorMessage += error.message;
            }

            showError('loginError', errorMessage);

            // Re-enable button
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Login';
        }
    });
}

// ========================================
// AUTHENTICATION STATE MANAGEMENT
// ========================================

/**
 * Check authentication state and redirect if needed
 */
auth.onAuthStateChanged((user) => {
    const currentPage = window.location.pathname.split('/').pop();

    if (user) {
        console.log('✅ User is logged in:', user.email);

        // Verify email domain
        if (!validateRVCEEmail(user.email)) {
            console.warn('⚠️ User email is not from RVCE domain');
            auth.signOut();
            if (currentPage !== 'login.html' && currentPage !== 'signup.html') {
                window.location.href = 'login.html';
            }
            return;
        }

        // If on login/signup page, redirect to main portal
        if (currentPage === 'login.html' || currentPage === 'signup.html') {
            window.location.href = 'index.html';
        }

        // Update UI with user info
        updateUIWithUser(user);

    } else {
        console.log('❌ User is not logged in');

        // If on protected page, redirect to login
        if (currentPage !== 'login.html' && currentPage !== 'signup.html') {
            window.location.href = 'login.html';
        }
    }
});

/**
 * Update UI with logged-in user information
 */
function updateUIWithUser(user) {
    // Update user display name in dropdown
    const userDisplayName = document.getElementById('userDisplayName');
    if (userDisplayName) {
        // Extract name from email (part before @)
        const emailName = user.email.split('@')[0];
        userDisplayName.textContent = emailName;
    }

    // Update user email in dropdown
    const userEmailText = document.getElementById('userEmailText');
    if (userEmailText) {
        userEmailText.textContent = user.email;
    }

    // Add logout event listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    // Auto-fill email in forms
    const lostItemContact = document.getElementById('lostItemContact');
    const foundItemContact = document.getElementById('foundItemContact');

    if (lostItemContact && !lostItemContact.value) {
        lostItemContact.value = user.email;
        lostItemContact.readOnly = true;
    }

    if (foundItemContact && !foundItemContact.value) {
        foundItemContact.value = user.email;
        foundItemContact.readOnly = true;
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    auth.signOut().then(() => {
        console.log('✅ User logged out');
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('❌ Logout error:', error);
        alert('Failed to logout. Please try again.');
    });
}

// Make logout function globally accessible
window.handleLogout = handleLogout;

console.log('✓ Authentication module loaded');

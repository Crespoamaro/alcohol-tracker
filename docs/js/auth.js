import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function logoutUser() {
    return await signOut(auth);
}

export function initAuth(onUserLogin, onUserLogout) {
    const form = document.getElementById('auth-form');
    const emailInput = document.getElementById('auth-email');
    const passInput = document.getElementById('auth-password');
    const nameInput = document.getElementById('auth-name'); 
    const errorMsg = document.getElementById('auth-error');
    const btnSubmit = document.getElementById('btn-submit-auth');
    const btnToggle = document.getElementById('btn-toggle-auth');
    const switchText = document.getElementById('auth-switch-text');
    
    let isRegistering = false;

    if (btnToggle) {
        btnToggle.onclick = (e) => {
            e.preventDefault();
            isRegistering = !isRegistering;
            btnSubmit.textContent = isRegistering ? "CREAR CUENTA" : "ENTRAR";
            switchText.textContent = isRegistering ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?";
            btnToggle.textContent = isRegistering ? "Inicia sesión" : "Regístrate";
            if (nameInput) nameInput.style.display = isRegistering ? "block" : "none";
        };
    }

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const email = emailInput.value;
            const password = passInput.value;
            const userName = nameInput.value.trim();

            try {
                if (isRegistering) {
                    const userCred = await createUserWithEmailAndPassword(auth, email, password);
                    // USAMOS EL NOMBRE COMO ID DEL DOCUMENTO
                    await setDoc(doc(db, "usuarios", userName), {
                        uid: userCred.user.uid,
                        email: email,
                        nombre: userName,
                        fechaRegistro: new Date()
                    });
                } else {
                    await signInWithEmailAndPassword(auth, email, password);
                }
            } catch (error) {
                errorMsg.textContent = "Error: Datos no válidos.";
            }
        };
    }

    onAuthStateChanged(auth, (user) => {
        if (user) onUserLogin(user);
        else onUserLogout();
    });
}
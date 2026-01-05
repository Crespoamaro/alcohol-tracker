import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const googleProvider = new GoogleAuthProvider();

export async function logoutUser() { return await signOut(auth); }

export function initAuth(onUserLogin, onUserLogout) {
    const form = document.getElementById('auth-form');
    const emailInput = document.getElementById('auth-email');
    const passInput = document.getElementById('auth-password');
    const nameInput = document.getElementById('auth-name'); 
    const errorMsg = document.getElementById('auth-error');
    const btnSubmit = document.getElementById('btn-submit-auth');
    const btnToggle = document.getElementById('btn-toggle-auth');
    const btnGoogle = document.getElementById('btn-google-auth');
    const btnForgot = document.getElementById('btn-forgot-pass');
    const switchText = document.getElementById('auth-switch-text');
    
    let isRegistering = false;

    // RECUPERAR CLAVE
    if (btnForgot) {
        btnForgot.onclick = async () => {
            const email = emailInput.value;
            if (!email) {
                errorMsg.textContent = "Introduce tu email primero.";
                errorMsg.style.color = "yellow";
                return;
            }
            try {
                await sendPasswordResetEmail(auth, email);
                errorMsg.textContent = "Email de recuperación enviado.";
                errorMsg.style.color = "lightgreen";
            } catch (e) { errorMsg.textContent = "Error al enviar email."; }
        };
    }

    // GOOGLE
    if (btnGoogle) {
        btnGoogle.onclick = async () => {
            try {
                const result = await signInWithPopup(auth, googleProvider);
                const user = result.user;
                const userDocName = user.displayName || user.email.split('@')[0];
                await setDoc(doc(db, "usuarios", userDocName), {
                    uid: user.uid, email: user.email, nombre: userDocName, fechaRegistro: new Date()
                }, { merge: true });
            } catch (e) { errorMsg.textContent = "Error con Google."; }
        };
    }

    // TOGGLE REGISTRO/LOGIN
    if (btnToggle) {
        btnToggle.onclick = (e) => {
            e.preventDefault();
            isRegistering = !isRegistering;
            btnSubmit.textContent = isRegistering ? "CREAR CUENTA" : "ENTRAR";
            switchText.textContent = isRegistering ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?";
            btnToggle.textContent = isRegistering ? "Inicia sesión" : "Regístrate";
            nameInput.style.display = isRegistering ? "block" : "none";
            nameInput.required = isRegistering;
        };
    }

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            errorMsg.style.color = "red";
            try {
                if (isRegistering) {
                    const res = await createUserWithEmailAndPassword(auth, emailInput.value, passInput.value);
                    await setDoc(doc(db, "usuarios", nameInput.value.trim()), {
                        uid: res.user.uid, email: emailInput.value, nombre: nameInput.value.trim(), fechaRegistro: new Date()
                    });
                } else {
                    await signInWithEmailAndPassword(auth, emailInput.value, passInput.value);
                }
            } catch (e) { errorMsg.textContent = "Error de acceso."; }
        };
    }

    onAuthStateChanged(auth, (user) => {
        if (user) onUserLogin(user);
        else onUserLogout();
    });
}
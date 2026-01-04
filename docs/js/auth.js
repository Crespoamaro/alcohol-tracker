import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const googleProvider = new GoogleAuthProvider();

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
    const btnGoogle = document.getElementById('btn-google-auth');
    const switchText = document.getElementById('auth-switch-text');
    
    let isRegistering = false;

    // LOGIN CON GOOGLE
    if (btnGoogle) {
    btnGoogle.onclick = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            
            // Importante: El nombre de Google puede tener puntos o espacios
            const userDocName = user.displayName || user.email.split('@')[0];
            const userRef = doc(db, "usuarios", userDocName);
            
            // Forzamos la actualización del UID para que las reglas de seguridad no nos bloqueen
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                nombre: userDocName,
                fechaRegistro: new Date()
            }, { merge: true }); // 'merge: true' evita borrar datos si ya existía
            
        } catch (error) {
            console.error("Error en Google Auth:", error);
            if (errorMsg) errorMsg.textContent = "Error al conectar con Google.";
        }
    };
}

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
            const userName = nameInput ? nameInput.value.trim() : "";

            try {
                if (isRegistering) {
                    const userCred = await createUserWithEmailAndPassword(auth, email, password);
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
                errorMsg.textContent = "Datos no válidos.";
            }
        };
    }

    onAuthStateChanged(auth, (user) => {
        if (user) onUserLogin(user);
        else onUserLogout();
    });
}
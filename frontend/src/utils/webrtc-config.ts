// Configuración WebRTC para asegurar disponibilidad
console.log('🔧 Configurando WebRTC...');

// Verificar disponibilidad de APIs WebRTC
const checkWebRTCAvailability = () => {
  console.log('📡 Verificando APIs WebRTC:');
  console.log('   RTCPeerConnection:', typeof RTCPeerConnection);
  console.log('   window.RTCPeerConnection:', typeof window.RTCPeerConnection);
  console.log('   webkitRTCPeerConnection:', typeof (window as any).webkitRTCPeerConnection);
  console.log('   mozRTCPeerConnection:', typeof (window as any).mozRTCPeerConnection);
  console.log('   globalThis.RTCPeerConnection:', typeof (globalThis as any).RTCPeerConnection);
  
  // Intentar crear una instancia de prueba
  try {
    if (window.RTCPeerConnection) {
      const pc = new window.RTCPeerConnection();
      console.log('✅ RTCPeerConnection disponible via window');
      pc.close();
    }
  } catch (e) {
    console.error('❌ Error creando RTCPeerConnection:', e);
  }
  
  try {
    if ((window as any).webkitRTCPeerConnection) {
      const pc = new (window as any).webkitRTCPeerConnection();
      console.log('✅ RTCPeerConnection disponible via webkit');
      pc.close();
    }
  } catch (e) {
    console.error('❌ Error creando webkitRTCPeerConnection:', e);
  }
};

// Ejecutar verificación cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkWebRTCAvailability);
} else {
  checkWebRTCAvailability();
}

// También verificar después de un pequeño delay para asegurar que todo esté cargado
setTimeout(checkWebRTCAvailability, 1000);

export {};

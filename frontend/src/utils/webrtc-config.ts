// Configuración WebRTC simplificada
console.log('🔧 Configurando WebRTC...');

// Verificar disponibilidad de APIs WebRTC de forma segura
const checkWebRTCAvailability = () => {
  console.log('📡 Verificando APIs WebRTC:');
  console.log('   RTCPeerConnection:', typeof RTCPeerConnection);
  console.log('   window.RTCPeerConnection:', typeof window.RTCPeerConnection);
  console.log('   webkitRTCPeerConnection:', typeof (window as any).webkitRTCPeerConnection);
  console.log('   mozRTCPeerConnection:', typeof (window as any).mozRTCPeerConnection);
  console.log('   globalThis.RTCPeerConnection:', typeof (globalThis as any).RTCPeerConnection);
  
  // Verificar si WebRTC está disponible
  const hasWebRTC = !!(
    window.RTCPeerConnection || 
    (window as any).webkitRTCPeerConnection || 
    (window as any).mozRTCPeerConnection
  );
  
  if (hasWebRTC) {
    console.log('✅ WebRTC está disponible');
  } else {
    console.warn('⚠️ WebRTC no está disponible - esto puede ser normal en desarrollo local');
  }
};

// Ejecutar verificación cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkWebRTCAvailability);
} else {
  checkWebRTCAvailability();
}

// También verificar después de un pequeño delay
setTimeout(checkWebRTCAvailability, 1000);

export {};

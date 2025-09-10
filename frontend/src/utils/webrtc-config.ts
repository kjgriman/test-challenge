// Configuración WebRTC para asegurar disponibilidad
console.log('🔧 Configurando WebRTC...');

// Forzar la disponibilidad de WebRTC APIs
const forceWebRTCAvailability = () => {
  console.log('🔧 Forzando disponibilidad de WebRTC...');
  
  // Verificar si las APIs están disponibles en el contexto global del navegador
  if (typeof window !== 'undefined') {
    // Intentar acceder a las APIs desde el contexto global del navegador
    const globalRTCPeerConnection = (window as any).RTCPeerConnection || 
                                   (window as any).webkitRTCPeerConnection || 
                                   (window as any).mozRTCPeerConnection;
    
    if (globalRTCPeerConnection) {
      console.log('✅ RTCPeerConnection encontrado en contexto global');
      
      // Asignar a window si no está disponible
      if (!window.RTCPeerConnection) {
        (window as any).RTCPeerConnection = globalRTCPeerConnection;
        console.log('✅ RTCPeerConnection asignado a window');
      }
      
      // Asignar a globalThis si no está disponible
      if (!(globalThis as any).RTCPeerConnection) {
        (globalThis as any).RTCPeerConnection = globalRTCPeerConnection;
        console.log('✅ RTCPeerConnection asignado a globalThis');
      }
    } else {
      console.error('❌ RTCPeerConnection no encontrado en ningún contexto');
      
      // Intentar crear desde el constructor nativo
      try {
        const testPC = new (window as any).RTCPeerConnection();
        console.log('✅ RTCPeerConnection funciona directamente');
        testPC.close();
      } catch (e) {
        console.error('❌ Error creando RTCPeerConnection:', e);
      }
    }
  }
};

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

// Ejecutar configuración inmediatamente
forceWebRTCAvailability();

// Ejecutar verificación cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkWebRTCAvailability);
} else {
  checkWebRTCAvailability();
}

// También verificar después de un pequeño delay para asegurar que todo esté cargado
setTimeout(() => {
  forceWebRTCAvailability();
  checkWebRTCAvailability();
}, 1000);

export {};

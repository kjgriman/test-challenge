// Declaraciones globales para WebRTC
declare global {
  interface Window {
    RTCPeerConnection: typeof RTCPeerConnection;
    webkitRTCPeerConnection: typeof RTCPeerConnection;
    mozRTCPeerConnection: typeof RTCPeerConnection;
    webkitGetUserMedia: any;
    mozGetUserMedia: any;
    getUserMedia: any;
  }
  
  interface Navigator {
    getUserMedia: any;
    webkitGetUserMedia: any;
    mozGetUserMedia: any;
  }
  
  const RTCPeerConnection: {
    new (configuration?: RTCConfiguration): RTCPeerConnection;
    prototype: RTCPeerConnection;
  };
  
  const webkitRTCPeerConnection: {
    new (configuration?: RTCConfiguration): RTCPeerConnection;
    prototype: RTCPeerConnection;
  };
  
  const mozRTCPeerConnection: {
    new (configuration?: RTCConfiguration): RTCPeerConnection;
    prototype: RTCPeerConnection;
  };
}

export {};

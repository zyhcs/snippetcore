export function showToast(message: string, type: 'info' | 'success' | 'error' = 'info', onClick?: () => void, duration: number = 3000) {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type, onClick, duration } }));
}

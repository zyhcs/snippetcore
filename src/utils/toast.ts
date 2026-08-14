export function showToast(message: string, type: 'info' | 'success' | 'error' = 'info') {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
}

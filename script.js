// Emergency Vehicle Booking System - Professional JavaScript
// Features: LocalStorage persistence, fake API, real-time updates, validation, admin dashboard

class EmergencyBookingSystem {
    constructor() {
        this.vehicles = [
            { id: 1, type: 'ambulance', name: 'Ambulance A1', status: 'available', eta: '5 mins', location: 'Central Hospital' },
            { id: 2, type: 'ambulance', name: 'Ambulance A2', status: 'available', eta: '7 mins', location: 'South Clinic' },
            { id: 3, type: 'fire', name: 'Fire Truck F1', status: 'available', eta: '8 mins', location: 'Fire Station 1' },
            { id: 4, type: 'fire', name: 'Fire Truck F2', status: 'busy', eta: '15 mins', location: 'Fire Station 2' },
            { id: 5, type: 'police', name: 'Police P1', status: 'available', eta: '4 mins', location: 'Police HQ' },
            { id: 6, type: 'police', name: 'Police P2', status: 'available', eta: '6 mins', location: 'District Station' }
        ];
        
        this.bookings = JSON.parse(localStorage.getItem('emergencyBookings')) || [];
        this.nextId = parseInt(localStorage.getItem('nextBookingId')) || 1;
        
        this.init();
    }
    
    init() {
        this.renderVehicles();
        this.renderAdminDashboard();
        this.updateRealTimeClock();
        this.bindEvents();
        this.simulateRealTimeUpdates();
        setInterval(() => this.updateRealTimeClock(), 1000);
    }
    
    bindEvents() {
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                target.scrollIntoView({ behavior: 'smooth' });
            });
        });
        
        // Regular booking form
        document.getElementById('bookingForm').addEventListener('submit', (e) => this.handleBooking(e));
        
        // 🚨 EMERGENCY QUICK BUTTON
        document.getElementById('emergencyBtn').addEventListener('click', () => {
            new bootstrap.Modal(document.getElementById('quickEmergencyModal')).show();
            this.playEmergencySound(); // Attention effect
        });
        
        // Quick emergency form
        document.getElementById('quickForm').addEventListener('submit', (e) => this.handleQuickBooking(e));
    }
    
    // Emergency button click - safe DOM ready check
    function initEmergencyBtn() {
        const btn = document.getElementById('emergencyBtn');
        if (btn) {
            btn.addEventListener('click', () => {
                const modal = new bootstrap.Modal(document.getElementById('quickEmergencyModal'));
                modal.show();
            });
        }
    }
    initEmergencyBtn();



    
    renderVehicles() {
        const container = document.getElementById('vehicleList');
        container.innerHTML = this.vehicles.map(vehicle => `
            <div class="col-md-4 mb-4">
                <div class="card vehicle-card h-100">
                    <div class="card-body text-center p-4">
                        <div class="vehicle-icon mb-3">
                            <i class="fas fa-${this.getVehicleIcon(vehicle.type)}"></i>
                        </div>
                        <h5 class="card-title">${vehicle.name}</h5>
                        <p class="text-muted">${vehicle.location}</p>
                        <span class="badge fs-6 fw-bold ${this.getStatusClass(vehicle.status)}">${vehicle.status.toUpperCase()}</span>
                        <div class="mt-3">
                            <small class="text-success fw-bold realtime">ETA: ${vehicle.eta} <i class="fas fa-sync-alt fa-spin ms-1" style="font-size:0.8em"></i></small>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    renderAdminDashboard() {
        const stats = this.getBookingStats();
        document.getElementById('totalBookings').textContent = stats.total;
        document.getElementById('pendingBookings').textContent = stats.pending;
        document.getElementById('completedBookings').textContent = stats.completed;
        
        this.renderBookingsTable();
    }
    
    renderBookingsTable() {
        const tbody = document.getElementById('bookingTable');
        const recent = this.bookings.slice(-5).reverse();
        tbody.innerHTML = recent.map(booking => `
            <tr>
                <td><strong>#${booking.id}</strong></td>
                <td>${booking.name}</td>
                <td><span class="badge bg-${this.getTypeColor(booking.type)}">${booking.type.toUpperCase()}</span></td>
                <td>${booking.location}</td>
                <td><span class="badge status-${booking.status}">${booking.status.toUpperCase()}</span></td>
                <td>${new Date(booking.time).toLocaleString()}</td>
            </tr>
        `).join('') || '<tr><td colspan="6" class="text-center text-muted py-4">No bookings yet</td></tr>';
    }
    
    async handleBooking(e) {
        e.preventDefault();
        
        // Advanced validation
        const formData = this.validateForm();
        if (!formData.valid) {
            this.showAlert(formData.errors[0], 'danger');
            return;
        }
        
        // Simulate API call with loading
        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading me-2"></span>Processing...';
        submitBtn.disabled = true;
        
        // Fake delay + processing
        await this.simulateApiCall();
        
        // Create booking
        const booking = {
            id: this.nextId++,
            ...formData.data,
            status: 'pending',
            time: Date.now(),
            eta: this.getRandomEta()
        };
        
        this.bookings.unshift(booking);
        localStorage.setItem('emergencyBookings', JSON.stringify(this.bookings));
        localStorage.setItem('nextBookingId', this.nextId);
        
        // Show confirmation
        document.getElementById('confirmMsg').textContent = `Vehicle ${this.getVehicleForType(formData.data.type)} dispatched to ${formData.data.location}`;
        document.getElementById('bookingId').textContent = `EM-${booking.id.toString().padStart(4, '0')}`;
        new bootstrap.Modal(document.getElementById('confirmModal')).show();
        
        // Reset form
        e.target.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Update UI
        setTimeout(() => {
            this.renderAdminDashboard();
            this.updateVehicleAvailability(formData.data.type);
        }, 500);
        
        this.showAlert('Booking confirmed! Help is on the way.', 'success');
    }
    
    validateForm() {
        const data = {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            type: document.getElementById('type').value,
            location: document.getElementById('location').value.trim(),
            description: document.getElementById('description').value.trim()
        };
        
        const errors = [];
        if (data.name.length < 2) errors.push('Name must be at least 2 characters');
        if (!/^[\d\s\-\+\(\)]{10,15}$/.test(data.phone)) errors.push('Valid phone number required');
        if (!data.type) errors.push('Select emergency type');
        if (data.location.length < 5) errors.push('Location too short');
        if (data.description.length < 10) errors.push('Describe emergency (min 10 chars)');
        
        return { valid: errors.length === 0, data, errors };
    }
    
    updateVehicleAvailability(type) {
        const vehicle = this.vehicles.find(v => v.type === type && v.status === 'available');
        if (vehicle) {
            vehicle.status = 'dispatched';
            this.renderVehicles();
        }
    }
    
    simulateApiCall() {
        return new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));
    }
    
    getRandomEta() {
        const etas = ['3-5 mins', '5-8 mins', '7-10 mins'];
        return etas[Math.floor(Math.random() * etas.length)];
    }
    
    getVehicleForType(type) {
        const names = {
            ambulance: 'Ambulance A1',
            fire: 'Fire Truck F1',
            police: 'Police P1'
        };
        return names[type];
    }
    
    getBookingStats() {
        const total = this.bookings.length;
        const pending = this.bookings.filter(b => b.status === 'pending').length;
        const completed = this.bookings.filter(b => b.status === 'completed').length;
        return { total, pending, completed };
    }
    
    getStatusClass(status) {
        return status === 'available' ? 'bg-success' : 'bg-warning';
    }
    
    getVehicleIcon(type) {
        const icons = { ambulance: 'truck-medical', fire: 'fire', police: 'car' };
        return icons[type] || 'car';
    }
    
    getTypeColor(type) {
        const colors = { ambulance: 'info', fire: 'danger', police: 'primary' };
        return colors[type];
    }
    
    updateRealTimeClock() {
        document.querySelectorAll('.realtime').forEach(el => {
            if (!el.hasAttribute('data-last-update')) {
                el.setAttribute('data-last-update', Date.now());
            }
        });
    }
    
    simulateRealTimeUpdates() {
        setInterval(() => {
            const busyVehicles = this.vehicles.filter(v => v.status === 'busy');
            if (busyVehicles.length > 0 && Math.random() < 0.3) {
                const vehicle = busyVehicles[Math.floor(Math.random() * busyVehicles.length)];
                vehicle.status = 'available';
                this.renderVehicles();
            }
            
            // Random new booking simulation
            if (Math.random() < 0.1) {
                const types = ['ambulance', 'fire', 'police'];
                const fakeBooking = {
                    id: this.nextId++,
                    name: ['John Doe', 'Jane Smith', 'Emergency Call'][Math.floor(Math.random()*3)],
                    type: types[Math.floor(Math.random()*3)],
                    location: 'Simulated Location',
                    status: 'pending',
                    time: Date.now()
                };
                this.bookings.unshift(fakeBooking);
                localStorage.setItem('emergencyBookings', JSON.stringify(this.bookings));
                localStorage.setItem('nextBookingId', this.nextId);
                this.renderAdminDashboard();
            }
        }, 15000); // Every 15 seconds
    }
    
    showAlert(message, type = 'info') {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 5000);
    }

    // 🚨 QUICK EMERGENCY HANDLER - Simplified + Urgent
    async handleQuickBooking(e) {
        e.preventDefault();
        
        // Quick validation (stricter)
        const quickData = this.validateQuickForm();
        if (!quickData.valid) {
            this.showAlert(quickData.errors[0], 'danger');
            // Shake modal for attention
            const modal = bootstrap.Modal.getInstance(document.getElementById('quickEmergencyModal'));
            document.getElementById('quickEmergencyModal').style.animation = 'emergencyShake 0.5s';
            setTimeout(() => {
                document.getElementById('quickEmergencyModal').style.animation = '';
            }, 500);
            return;
        }
        
        // Copy to main form (reuse validation/handling)
        document.getElementById('name').value = quickData.data.name;
        document.getElementById('phone').value = quickData.data.phone;
        document.getElementById('type').value = quickData.data.type;
        document.getElementById('location').value = quickData.data.location;
        document.getElementById('description').value = `QUICK EMERGENCY: ${quickData.data.location}`;
        
        // Close quick modal, trigger main booking
        bootstrap.Modal.getInstance(document.getElementById('quickEmergencyModal')).hide();
        
        // Immediate main form submission
        const mainForm = document.getElementById('bookingForm');
        const mainEvent = new Event('submit', { bubbles: true, cancelable: true });
        mainForm.dispatchEvent(mainEvent);
        
        this.showAlert('🚨 EMERGENCY DISPATCHED IMMEDIATELY!', 'danger');
        this.playEmergencySound();
    }
    
    validateQuickForm() {
        const data = {
            name: document.getElementById('quickName').value.trim(),
            phone: document.getElementById('quickPhone').value.trim(),
            type: document.getElementById('quickType').value,
            location: document.getElementById('quickLocation').value.trim()
        };
        
        const errors = [];
        if (!data.name || data.name.length < 1) errors.push('NAME REQUIRED');
        if (!data.phone || data.phone.length < 8) errors.push('VALID PHONE REQUIRED');
        if (!data.type) errors.push('EMERGENCY TYPE REQUIRED');
        if (!data.location || data.location.length < 3) errors.push('LOCATION REQUIRED');
        
        return { valid: errors.length === 0, data, errors };
    }
    
    // Emergency sound effect (uses Web Audio API)
    playEmergencySound() {
        // Siren beep sequence
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const playTone = (freq, duration) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.value = freq;
            oscillator.type = 'sawtooth';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };
        
        // Siren: high-low-high
        playTone(800, 0.2);
        setTimeout(() => playTone(400, 0.2), 200);
        setTimeout(() => playTone(800, 0.3), 400);
    }

}

// Initialize when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    new EmergencyBookingSystem();
});

// Service Worker for PWA-like experience (professional touch)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

// PWA Meta tags already in HTML via Bootstrap responsiveness


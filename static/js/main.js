// Menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const mainMenu = document.querySelector('.main-menu');
const overlay = document.querySelector('.overlay');
const mainContent = document.querySelector('.main-content');

menuToggle.addEventListener('click', function() {
    mainMenu.classList.toggle('active');
    overlay.classList.toggle('active');
    mainContent.classList.toggle('menu-active');
});

// Đóng menu khi click vào overlay
overlay.addEventListener('click', function() {
    mainMenu.classList.remove('active');
    overlay.classList.remove('active');
    mainContent.classList.remove('menu-active');
});

// Đóng menu khi nhấn phím Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mainMenu.classList.contains('active')) {
        mainMenu.classList.remove('active');
        overlay.classList.remove('active');
        mainContent.classList.remove('menu-active');
    }
});

// SoundCloud Player Controls
let scPlayer;
let tracks = [];
let currentTrackIndex = -1;

// Khởi tạo SoundCloud Player
document.addEventListener('DOMContentLoaded', function() {
    const iframeElement = document.getElementById('soundcloud-player');
    if (iframeElement) {
        scPlayer = SC.Widget(iframeElement);
        
        // Lắng nghe sự kiện khi player đã sẵn sàng
        scPlayer.bind(SC.Widget.Events.READY, function() {
            // Lấy danh sách tracks
            scPlayer.getSounds(function(soundList) {
                tracks = soundList;
            });
        });

        // Lắng nghe sự kiện khi một bài hát kết thúc
        scPlayer.bind(SC.Widget.Events.FINISH, function() {
            if (currentTrackIndex < tracks.length - 1) {
                currentTrackIndex++;
                scPlayer.skip(currentTrackIndex);
            }
        });
    }
});

// Phát tất cả từ đầu
function playAll() {
    if (scPlayer) {
        currentTrackIndex = 0;
        scPlayer.skip(0);
        scPlayer.play();
    }
}

// Phát ngẫu nhiên
function playRandom() {
    if (scPlayer && tracks.length > 0) {
        currentTrackIndex = Math.floor(Math.random() * tracks.length);
        scPlayer.skip(currentTrackIndex);
        scPlayer.play();
    }
}

// Tạm dừng
function pauseAll() {
    if (scPlayer) {
        scPlayer.pause();
    }
}

// Xử lý form submission
const ritualForm = document.getElementById('ritualForm');
if (ritualForm) {
    ritualForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        
        try {
            const response = await fetch('/get-ritual', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            // Hiển thị nội dung bài cúng
            document.getElementById('ritualTitle').textContent = data.title;
            document.getElementById('ritualText').innerHTML = data.content.replace(/\n/g, '<br>');
            
            // Hiển thị lễ vật
            const offeringsList = document.querySelector('#ritualOfferings ul');
            offeringsList.innerHTML = data.offerings.map(item => 
                `<li>${item}</li>`
            ).join('');
            
            // Hiển thị hướng dẫn
            const instructionsHtml = data.instructions.map(instruction => 
                `<li>${instruction}</li>`
            ).join('');
            document.getElementById('ritualInstructions').innerHTML = `
                <h3>Hướng dẫn thực hiện:</h3>
                <ul>${instructionsHtml}</ul>
            `;
            
            document.getElementById('ritualContent').style.display = 'block';
            
            // Cuộn đến phần nội dung
            document.getElementById('ritualContent').scrollIntoView({
                behavior: 'smooth'
            });
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Có lỗi xảy ra, vui lòng thử lại sau.');
        }
    });
}

// Chức năng chia sẻ
function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('Lễ Cúng Giao Thừa');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&t=${title}`, 
                '_blank');
}

function shareOnZalo() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://zalo.me/share?u=${url}`, '_blank');
}

// Xử lý input date
const birthdateInput = document.getElementById('birthdate');
if (birthdateInput) {
    // Thêm / tự động khi nhập
    birthdateInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, ''); // Chỉ giữ lại số
        if (value.length > 0) {
            // Thêm / sau ngày
            if (value.length >= 2) {
                value = value.slice(0,2) + '/' + value.slice(2);
            }
            // Thêm / sau tháng
            if (value.length >= 5) {
                value = value.slice(0,5) + '/' + value.slice(5);
            }
            // Giới hạn độ dài
            if (value.length > 10) {
                value = value.slice(0,10);
            }
        }
        e.target.value = value;
    });

    // Validate date khi submit
    birthdateInput.addEventListener('change', function(e) {
        const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const value = e.target.value;
        
        if (datePattern.test(value)) {
            const [, day, month, year] = value.match(datePattern);
            const date = new Date(year, month - 1, day);
            
            // Kiểm tra ngày hợp lệ
            if (date.getDate() != day || 
                date.getMonth() + 1 != month || 
                date.getFullYear() != year) {
                e.target.setCustomValidity('Ngày không hợp lệ');
            } else {
                e.target.setCustomValidity('');
            }
        }
    });
}

// Xử lý form cúng dường
const donateForm = document.getElementById('donateForm');
if (donateForm) {
    donateForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const selectedBank = formData.get('payment_method');
        const amount = formData.get('amount');
        const purpose = formData.get('purpose');
        const donorName = formData.get('donor_name');
        
        // Hiển thị thông tin thanh toán
        document.getElementById('bankName').textContent = selectedBank;
        document.getElementById('accountNumber').textContent = getAccountNumber(selectedBank);
        document.getElementById('accountName').textContent = getAccountName(selectedBank);
        document.getElementById('amount').textContent = formatMoney(amount);
        document.getElementById('transferMessage').textContent = 
            `CUNG DUONG - ${donorName} - ${purpose}`;
        
        // Hiển thị QR code tương ứng
        document.getElementById('qrCode').src = 
            `/static/images/${selectedBank.toLowerCase()}_qr.png`;
        
        // Hiển thị phần thông tin thanh toán
        document.getElementById('paymentInfo').style.display = 'block';
        
        // Cuộn đến phần thông tin thanh toán
        document.getElementById('paymentInfo').scrollIntoView({
            behavior: 'smooth'
        });
    });
}

// Hàm hỗ trợ
function getAccountNumber(bank) {
    const accounts = {
        'VPBank': '123456789',  // Số tài khoản VPBank
        'MoMo': '0987654321'
    };
    return accounts[bank] || '';
}

function getAccountName(bank) {
    return 'NGUYEN VAN A';  // Tên chủ tài khoản
}

function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount);
}

function copyTransferInfo() {
    const bankName = document.getElementById('bankName').textContent;
    const accountNumber = document.getElementById('accountNumber').textContent;
    const accountName = document.getElementById('accountName').textContent;
    const amount = document.getElementById('amount').textContent;
    const message = document.getElementById('transferMessage').textContent;
    
    const text = `Ngân hàng: ${bankName}
Số tài khoản: ${accountNumber}
Chủ tài khoản: ${accountName}
Số tiền: ${amount} VNĐ
Nội dung CK: ${message}`;
    
    navigator.clipboard.writeText(text).then(() => {
        alert('Đã sao chép thông tin thanh toán!');
    });
}

// Xử lý hiển thị trường tên người đã khuất
document.querySelector('select[name="ritual_type"]').addEventListener('change', function(e) {
    const deceasedNameGroup = document.querySelector('.deceased-name-group');
    if (e.target.value === 'grave_ritual') {
        deceasedNameGroup.style.display = 'block';
        deceasedNameGroup.querySelector('input').required = true;
    } else {
        deceasedNameGroup.style.display = 'none';
        deceasedNameGroup.querySelector('input').required = false;
    }
}); 
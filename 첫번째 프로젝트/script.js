
document.addEventListener('DOMContentLoaded', function() {
    const drawBtn = document.getElementById('drawBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultContainer = document.getElementById('result');
    const selectedNumbers = document.getElementById('selectedNumbers');
    const currentDateSpan = document.getElementById('currentDate');
    const statsSection = document.getElementById('statsSection');
    const drawCountSpan = document.getElementById('drawCount');
    const lastDrawTimeSpan = document.getElementById('lastDrawTime');

    // 로컬 스토리지에서 통계 불러오기
    let drawCount = parseInt(localStorage.getItem('drawCount') || '0');
    let lastDrawTime = localStorage.getItem('lastDrawTime') || '';

    // 초기화
    updateStats();
    displayCurrentDate();

    drawBtn.addEventListener('click', drawCleaningDuty);
    resetBtn.addEventListener('click', resetSelection);

    function displayCurrentDate() {
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            weekday: 'long' 
        };
        currentDateSpan.textContent = now.toLocaleDateString('ko-KR', options);
    }

    function updateStats() {
        drawCountSpan.textContent = drawCount;
        lastDrawTimeSpan.textContent = lastDrawTime || '-';
        if (drawCount > 0) {
            statsSection.classList.remove('d-none');
        }
    }

    async function drawCleaningDuty() {
        // 확인 대화상자
        const confirmation = await Swal.fire({
            title: '청소당번을 뽑으시겠습니까?',
            text: '1번부터 25번까지 중에서 5명을 랜덤으로 선발합니다',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#667eea',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '네, 뽑겠습니다!',
            cancelButtonText: '취소',
            background: '#fff',
            backdrop: `
                rgba(102, 126, 234, 0.2)
                left top
                no-repeat
            `
        });

        if (!confirmation.isConfirmed) return;

        // 로딩 표시
        Swal.fire({
            title: '청소당번 뽑는 중...',
            html: '<i class="fas fa-dice fa-spin fa-2x text-primary"></i>',
            showConfirmButton: false,
            allowOutsideClick: false,
            timer: 2000,
            background: '#fff'
        });

        // 버튼에 애니메이션 효과
        drawBtn.classList.add('pulse-custom');

        setTimeout(async () => {
            // 1부터 25까지의 숫자 배열 생성
            const numbers = Array.from({length: 25}, (_, i) => i + 1);
            
            // Fisher-Yates 셔플 알고리즘으로 배열을 섞음
            for (let i = numbers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
            }
            
            // 처음 5개 숫자 선택하고 정렬
            const selected = numbers.slice(0, 5).sort((a, b) => a - b);
            
            // 통계 업데이트
            drawCount++;
            lastDrawTime = new Date().toLocaleTimeString('ko-KR');
            localStorage.setItem('drawCount', drawCount.toString());
            localStorage.setItem('lastDrawTime', lastDrawTime);
            updateStats();

            // 성공 메시지와 함께 결과 표시
            await Swal.fire({
                title: '🎉 청소당번이 뽑혔습니다!',
                html: `
                    <div class="d-flex justify-content-center flex-wrap gap-2 mt-3">
                        ${selected.map(num => `
                            <span class="badge bg-success fs-5 p-3 rounded-circle">${num}번</span>
                        `).join('')}
                    </div>
                `,
                icon: 'success',
                confirmButtonColor: '#48bb78',
                confirmButtonText: '확인',
                showClass: {
                    popup: 'animate__animated animate__bounceIn'
                },
                hideClass: {
                    popup: 'animate__animated animate__bounceOut'
                }
            });

            // 결과 표시
            displayResults(selected);
            
            // 버튼 상태 변경
            drawBtn.classList.remove('pulse-custom');
            drawBtn.classList.add('d-none');
            resetBtn.classList.remove('d-none');
            resultContainer.classList.remove('d-none');
            resultContainer.classList.add('show');
        }, 2000);
    }

    function displayResults(numbers) {
        selectedNumbers.innerHTML = '';
        
        numbers.forEach((num, index) => {
            setTimeout(() => {
                const badge = document.createElement('div');
                badge.className = 'number-badge';
                badge.innerHTML = `<strong>${num}번</strong>`;
                
                // 호버 효과 추가
                badge.addEventListener('mouseenter', function() {
                    this.classList.add('sparkle');
                });
                badge.addEventListener('mouseleave', function() {
                    this.classList.remove('sparkle');
                });
                
                selectedNumbers.appendChild(badge);
            }, index * 300); // 각 번호를 300ms 간격으로 표시
        });
    }

    async function resetSelection() {
        const confirmation = await Swal.fire({
            title: '다시 뽑으시겠습니까?',
            text: '현재 결과가 초기화됩니다',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '네, 다시 뽑겠습니다',
            cancelButtonText: '취소'
        });

        if (!confirmation.isConfirmed) return;

        // 결과 숨기기
        resultContainer.classList.remove('show');
        resultContainer.classList.add('d-none');
        resetBtn.classList.add('d-none');
        
        // 버튼 상태 복원
        setTimeout(() => {
            drawBtn.classList.remove('d-none');
            selectedNumbers.innerHTML = '';
        }, 300);

        // 성공 토스트 메시지
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });

        Toast.fire({
            icon: 'info',
            title: '새로운 뽑기 준비 완료!'
        });
    }

    // 엔터키로도 뽑기 가능
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !drawBtn.classList.contains('d-none')) {
            drawCleaningDuty();
        }
    });

    // 페이지 로드시 환영 메시지 (한 번만)
    if (!localStorage.getItem('welcomeShown')) {
        setTimeout(() => {
            Swal.fire({
                title: '청소당번 뽑기에 오신 것을 환영합니다! 🎉',
                text: '공정하고 투명한 랜덤 선발 시스템입니다',
                icon: 'info',
                confirmButtonColor: '#667eea',
                confirmButtonText: '시작하기'
            });
            localStorage.setItem('welcomeShown', 'true');
        }, 1000);
    }

    // 통계 초기화 기능 (숨겨진 기능 - 더블클릭)
    statsSection.addEventListener('dblclick', async function() {
        const confirmation = await Swal.fire({
            title: '통계를 초기화하시겠습니까?',
            text: '모든 기록이 삭제됩니다',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '초기화',
            cancelButtonText: '취소'
        });

        if (confirmation.isConfirmed) {
            localStorage.removeItem('drawCount');
            localStorage.removeItem('lastDrawTime');
            drawCount = 0;
            lastDrawTime = '';
            updateStats();
            
            Swal.fire({
                icon: 'success',
                title: '통계가 초기화되었습니다',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
});

const ctx = document.getElementById('myChart');
const backgroundColor = '#ff7383';
let chart;

async function createChart() {

  try {
    const response = await fetch('/analytics/chartData');
    const data = await response.json();

    const dates = data.map(item => item.comment_date);
    const totalComments = data.map(item => item.total_comments);

    setTimeout(() => {
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: dates,
          datasets: [{
            label: '# of Comments',
            data: totalComments,
            backgroundColor: backgroundColor,
            borderWidth: 1
          }]
        },
        options: {
          animation: {
            duration: 1500,
            easing: 'easeInOutQuart'
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }, 1000); 
  } catch (error) {
    console.error(error);
  }
}

createChart();


// this code for tab part
  function openTab(evt, summaryOpt) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(summaryOpt).style.display = "block";
    evt.currentTarget.className += " active";
  }

  document.getElementById("defaultOpen").click();

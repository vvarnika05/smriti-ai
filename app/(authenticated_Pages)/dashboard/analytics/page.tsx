    "use client";

    import { useEffect, useRef, useState } from "react";
    import axios from "axios";
    import { Bar, Line, Radar } from "react-chartjs-2";
    import {
      Chart as ChartJS,
      CategoryScale,
      LinearScale,
      BarElement,
      Title,
      Tooltip,
      Legend,
      PointElement,
      LineElement,
      RadialLinearScale,
    } from 'chart.js';

    import { getElementAtEvent } from 'react-chartjs-2';
    import ErrorBoundary from './error-boundary';

    ChartJS.register(
      CategoryScale,
      LinearScale,
      BarElement,
      Title,
      Tooltip,
      Legend,
      PointElement,
      LineElement,
      RadialLinearScale
    );

    const AnalyticsPageContent = () => {
      const [analyticsData, setAnalyticsData] = useState(null);
      const barRef = useRef<ChartJS>(null);
      const lineRef = useRef<ChartJS>(null);
      const radarRef = useRef<ChartJS>(null);

      useEffect(() => {
        const fetchAnalyticsData = async () => {
          const { data } = await axios.get("/api/analytics");
          setAnalyticsData(data);
        };
        fetchAnalyticsData();
      }, []);

      if (!analyticsData) {
        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <style jsx>{`
              .loader {
                border: 16px solid #f3f3f3;
                border-radius: 50%;
                border-top: 16px solid #3498db;
                width: 120px;
                height: 120px;
                -webkit-animation: spin 2s linear infinite; /* Safari */
                animation: spin 2s linear infinite;
              }
              /* Safari */
              @-webkit-keyframes spin {
                0% { -webkit-transform: rotate(0deg); }
                100% { -webkit-transform: rotate(360deg); }
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <div className="loader"></div>
          </div>
        );
      }

      const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: 'Chart.js Doughnut Chart',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y;
                }
                return label;
              }
            }
          }
        }
      };

      const handleBarClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (barRef.current) {
          const elements = getElementAtEvent(barRef.current, event);
          if (elements.length > 0) {
            console.log(elements[0]);
          }
        }
      };
      const handleLineClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (lineRef.current) {
          const elements = getElementAtEvent(lineRef.current, event);
          if (elements.length > 0) {
            console.log(elements[0]);
          }
        }
      };
      const handleRadarClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (radarRef.current) {
          const elements = getElementAtEvent(radarRef.current, event);
          if (elements.length > 0) {
            console.log(elements[0]);
          }
        }
      };

      return (
        <div>
          <h1 className="text-2xl font-bold mb-4">Performance Analytics</h1>

          {/* Average Score by Topic */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Average Score by Topic</h2>
            <Bar
              ref={barRef}
              options={options}
              onClick={handleBarClick}
              data={{
                labels: analyticsData.averageScorePerTopic.map((item) => item.quizId),
                datasets: [
                  {
                    label: "Average Score",
                    data: analyticsData.averageScorePerTopic.map((item) => item._avg.score),
                  },
                ],
              }}
            />
          </div>

          {/* Performance Over Time */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Performance Over Time (7 vs 30 days)</h2>
            <Line
              ref={lineRef}
              options={options}
              onClick={handleLineClick}
              data={{
                labels: analyticsData.performanceTrends30Days.map((item) =>
                  new Date(item.createdAt).toLocaleDateString()
                ),
                datasets: [
                  {
                    label: 'Last 30 Days',
                    data: analyticsData.performanceTrends30Days.map((item) => item.score),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                  },
                  {
                    label: 'Last 7 Days',
                    data: analyticsData.performanceTrends7Days.map((item) => item.score),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                  },
                ],
              }}
            />
          </div>

          {/* Strengths and Weaknesses */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Strengths and Weaknesses</h2>
            <Radar
              ref={radarRef}
              options={options}
              onClick={handleRadarClick}
              data={{
                labels: analyticsData.averageScorePerTopic.map((item) => item.quizId),
                datasets: [
                  {
                    label: "Your Performance",
                    data: analyticsData.averageScorePerTopic.map((item) => item._avg.score),
                  },
                ],
              }}
            />
          </div>

          {/* AI Insights */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Personalized Recommendations</h2>
            <p>{analyticsData.aiInsights}</p>
          </div>
        </div>
      );
    };

    const AnalyticsPage = () => (
      <ErrorBoundary>
        <AnalyticsPageContent />
      </ErrorBoundary>
    );

    export default AnalyticsPage;

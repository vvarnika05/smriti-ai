    "use client";

    import { useEffect, useState } from "react";
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

    const AnalyticsPage = () => {
      const [analyticsData, setAnalyticsData] = useState(null);

      useEffect(() => {
        const fetchAnalyticsData = async () => {
          const { data } = await axios.get("/api/analytics");
          setAnalyticsData(data);
        };
        fetchAnalyticsData();
      }, []);

      if (!analyticsData) {
        return <div>Loading...</div>;
      }

      return (
        <div>
          <h1 className="text-2xl font-bold mb-4">Performance Analytics</h1>

          {/* Average Score by Topic */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Average Score by Topic</h2>
            <Bar
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
            <h2 className="text-xl font-semibold mb-2">Performance Over Time</h2>
            <Line
              data={{
                labels: analyticsData.performanceTrends.map((item) =>
                  new Date(item.createdAt).toLocaleDateString()
                ),
                datasets: [
                  {
                    label: "Score",
                    data: analyticsData.performanceTrends.map((item) => item.score),
                  },
                ],
              }}
            />
          </div>

          {/* Strengths and Weaknesses */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Strengths and Weaknesses</h2>
            <Radar
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

    export default AnalyticsPage;

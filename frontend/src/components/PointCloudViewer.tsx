// PointCloudViewer.tsx
import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { apiService } from '../services/api';

interface PointCloudViewerProps {
  date: string;
  captureId: string;
}

type Point = [number, number, number];

const PointCloudViewer: React.FC<PointCloudViewerProps> = ({ date, captureId }) => {
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    async function load() {
      const data = await apiService.getPointCloud(date, captureId);
      console.log("Loaded point cloud data:", data);
      setPoints(data.points as Point[] ?? []);
    }
    load();
  }, [date, captureId]);

  if (points.length === 0) {
    return <div>No point cloud loaded.</div>;
  }

  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const zs = points.map((p) => p[2]);

  return (
    <Plot
      data={[
        {
          x: xs,
          y: ys,
          z: zs,
          mode: "markers",
          type: "scatter3d",
          marker: { size: 2 },
        } as any,
      ]}
      layout={{
        autosize: true,
        margin: { l: 0, r: 0, t: 0, b: 0 },
        scene: { aspectmode: "data" },
      }}
      style={{ width: "100%", height: "400px" }}
    />
  );
};

export default PointCloudViewer;

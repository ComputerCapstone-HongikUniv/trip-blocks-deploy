// DummyImage.jsx

function DummyImage({ width = 200, height = 150, text = "Image" }) {
  const style = {
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: "#EFEFEF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#666",
    fontSize: "14px",
    borderRadius: "8px", // 모서리 살짝 둥글게
  };

  return <div style={style}>{text}</div>
}

export default DummyImage;
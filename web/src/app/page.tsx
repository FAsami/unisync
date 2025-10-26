import { Button, Typography } from "antd";
import { HomeOutlined } from "@ant-design/icons";

const Home = () => {
  return (
    <Button type='primary' icon={<HomeOutlined />} key='home'>
      Home
    </Button>
  );
};
export default Home;

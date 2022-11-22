import { Button, Result } from "antd";

const WrongNetwork = () => {
  const onHowto = () => {
    window.open("https://www.openattestation.com/docs/appendix/goerli-setup/");
  };

  return (
    <Result
      status="warning"
      title="You are not connected to Goerli network."
      subTitle="Please connect to Goerli in MetaMask first!"
      extra={
        <Button type="primary" key="howto" onClick={onHowto}>
          How to do?
        </Button>
      }
    />
  );
};

export default WrongNetwork;

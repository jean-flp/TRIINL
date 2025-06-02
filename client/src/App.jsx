import "./App.css";
import TemporaryDrawer from "./Header";
import useStore from "./store/store";
import theme from "./assets/palette";
import Login from "./pages/Login";
import Emprestimos from "./pages/Emprestimos";
import BrowseLibrary from "./pages/Catalogo";

const componentStrategies = {
  0: Login,
  1: BrowseLibrary,
  2: Emprestimos,
  default: Emprestimos,
};
function App() {
  const escolha = useStore((state) => state.escolha);

  const renderMainContent = () => {
    const Component =
      componentStrategies[escolha] || componentStrategies.default;
    return <Component />;
  };

  return (
    <>
      <h1 style={{ color: theme.palette.custom.navy }}>
        {componentStrategies[escolha]?.name || "Login"}
      </h1>

      <div className="top-left">
        <TemporaryDrawer />
      </div>
      <div>{renderMainContent()}</div>
    </>
  );
}

export default App;

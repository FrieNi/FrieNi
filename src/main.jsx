// Mount the React app
const App = () => {
  const [state, setState] = useState(window.AppStore.get());
  useEffect(() => window.AppStore.subscribe(s => setState({ ...s })), []);
  return (
    <>
      <AppRoutes />
      <FrieNiTweaks />
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

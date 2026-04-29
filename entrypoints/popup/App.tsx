
function App() {
  const createTab = () => {
    browser.tabs.create({
      // url: browser.runtime.getURL('tab/index.html')
    });
  };
  return (
    <div className="w-64 bg-blue-600 p-4 shadow-md">
      <div className="mb-4 flex items-center space-x-2">
        <i className="ri-bubble-chart-fill text-2xl text-white" />
        <h1 className="font-medium text-white">Sparql Browser Extension</h1>
      </div>
      <div className="w-full">
        <button
          onClick={createTab}
          className="w-full rounded-lg bg-white p-2 text-center font-medium text-blue-600 transition duration-200 hover:bg-gray-200">
          Open Editor
        </button>
      </div>
    </div>
  );
};

export default App;

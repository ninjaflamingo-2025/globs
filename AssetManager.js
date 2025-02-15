class AssetManager extends EventTarget {
  constructor(asset_store, loaders){
    super()
    this.asset_store = asset_store
    this.state = new Proxy(
      {
        total: 0,
        in_progress: 0,
        completed: 0
      },
      {
        set: (target, prop, value) => {
          
          target[prop] = value;
          
          const { completed, total } = this.state
          const progress = (completed / total) * 100;

          if(completed === total){
            const event = new CustomEvent('complete', { detail: { message: 'Task complete' } });
            this.dispatchEvent(event);
            // dispatchevent 
          }else {
            const event = new CustomEvent('loading', { detail: { status: progress } });
            this.dispatchEvent(event);
          }
          return true;  
        }
      }
    );
    this.assets = []
    this.loaders = loaders
    /*
     {
      cube_texture_loader: new THREE.CubeTextureLoader(),
      gltfl_loader: new GLTFLoader(),
      texture_loader: new THREE.TextureLoader()
    }
    */
  }
  
  add(asset){
    const count = this.assets.push(asset);
    this.state.total = count 
  }
  // only objects with geometries can have a bounding box
  loadAsset(asset){
    const { asset_store } = this
    if (!asset_store) {
      throw new Error(`ERR asset_store not set  ${typeof asset_store}`);
    }
    if(!asset_store[asset.path]){
      throw new Error(`PATH does not exist in asset_store: '${asset.path}'`);
    }
    const loader = this.loaders[asset.loader]; 
    loader.setCrossOrigin("anonymous");
    if (loader) {
      loader.load(asset.data, (result) => {
        if(asset.loader === 'gltfl_loader'){
          const model = result.scene;
          asset_store[asset.path][asset.name] = model
        }else {
          asset_store[asset.path][asset.name] = result;
        }
        this.state.completed += 1
        asset = null // change later, the result will still need to go to the asset store 
      }, (xhr) => {
        const progress = (xhr.loaded / xhr.total) * 100;
      }, (error) => {
        console.error(`Error loading ${asset.name}:`, error);
      });
    } else {
      console.error(`Loader for ${asset.loader} not found.`);
    }
  }
  
  loadAssets() {
    const { assets } = this
    const length = assets.length
    for(let i=0; i < length; i++){
      const asset = assets.shift()
      this.loadAsset(asset)
    }
  }
  on(event, listener) {
    this.addEventListener(event, listener);
  }
}

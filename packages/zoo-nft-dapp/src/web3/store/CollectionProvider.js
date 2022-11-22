import { useReducer } from "react";
import { IpfsGateway } from "../../Constants";

import CollectionContext from "./collection-context";

const defaultCollectionState = {
  contract: null,
  totalSupply: null,
  collection: [],
  nftIsLoading: true,
};

const collectionReducer = (state, action) => {
  if (action.type === "CONTRACT") {
    return {
      contract: action.contract,
      totalSupply: state.totalSupply,
      collection: state.collection,
      nftIsLoading: state.nftIsLoading,
    };
  }

  if (action.type === "LOADSUPPLY") {
    return {
      contract: state.contract,
      totalSupply: action.totalSupply,
      collection: state.collection,
      nftIsLoading: state.nftIsLoading,
    };
  }

  if (action.type === "LOADCOLLECTION") {
    return {
      contract: state.contract,
      totalSupply: state.totalSupply,
      collection: action.collection,
      nftIsLoading: state.nftIsLoading,
    };
  }

  if (action.type === "UPDATECOLLECTION") {
    const index = state.collection.findIndex(
      (NFT) => NFT.id === parseInt(action.NFT.id)
    );
    let collection = [];

    if (index === -1) {
      collection = [action.NFT, ...state.collection];
    } else {
      collection = [...state.collection];
    }

    return {
      contract: state.contract,
      totalSupply: state.totalSupply,
      collection: collection,
      nftIsLoading: state.nftIsLoading,
    };
  }

  if (action.type === "UPDATEOWNER") {
    const index = state.collection.findIndex(
      (NFT) => NFT.id === parseInt(action.id)
    );
    let collection = [...state.collection];
    collection[index].owner = action.newOwner;

    return {
      contract: state.contract,
      totalSupply: state.totalSupply,
      collection: collection,
      nftIsLoading: state.nftIsLoading,
    };
  }

  if (action.type === "LOADING") {
    return {
      contract: state.contract,
      totalSupply: state.totalSupply,
      collection: state.collection,
      nftIsLoading: action.loading,
    };
  }

  return defaultCollectionState;
};

const CollectionProvider = (props) => {
  const [CollectionState, dispatchCollectionAction] = useReducer(
    collectionReducer,
    defaultCollectionState
  );

  const loadContractHandler = (web3, NFTCollection) => {
    const contract = new web3.eth.Contract(
      NFTCollection.abi,
      NFTCollection.address
    );
    dispatchCollectionAction({ type: "CONTRACT", contract: contract });
    return contract;
  };

  const loadTotalSupplyHandler = async (contract) => {
    const totalSupply = await contract.methods.totalSupply().call();
    dispatchCollectionAction({ type: "LOADSUPPLY", totalSupply: totalSupply });
    return totalSupply;
  };

  const loadCollectionHandler = async (contract, totalSupply) => {
    var collection = [];
    for (var i = 0; i < totalSupply; i++) {
      collection.push({});
    }
    dispatchCollectionAction({
      type: "LOADCOLLECTION",
      collection: collection,
    });

    collection = [];

    for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
      try {
        const hash = await contract.methods.tokenURI(tokenId).call();
        console.log("hash", hash);
        const response = await fetch(`${IpfsGateway}/${hash}?clear`);
        if (!response.ok) {
          throw new Error("Something went wrong");
        }

        const metadata = await response.json();
        const owner = await contract.methods.ownerOf(tokenId).call();

        collection = [
          {
            id: tokenId,
            title: metadata.properties.name.description,
            description: metadata.properties.description.description,
            img: metadata.properties.image.description,
            owner: owner,
          },
          ...collection,
        ];
      } catch {
        console.error("Something went wrong");
      }
    }
    dispatchCollectionAction({
      type: "LOADCOLLECTION",
      collection: collection,
    });
  };

  const updateCollectionHandler = async (contract, id, owner) => {
    let NFT;
    const hash = await contract.methods.tokenURI(id).call();
    console.log("hash", hash);
    try {
      const response = await fetch(`${IpfsGateway}/${hash}?clear`);
      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      const metadata = await response.json();

      NFT = {
        id: parseInt(id),
        title: metadata.properties.name.description,
        description: metadata.properties.description.description,
        img: metadata.properties.image.description,
        owner: owner,
      };
    } catch {
      console.error("Something went wrong");
    }
    dispatchCollectionAction({ type: "UPDATECOLLECTION", NFT: NFT });
  };

  const updateOwnerHandler = (id, newOwner) => {
    dispatchCollectionAction({
      type: "UPDATEOWNER",
      id: id,
      newOwner: newOwner,
    });
  };

  const setNftIsLoadingHandler = (loading) => {
    dispatchCollectionAction({ type: "LOADING", loading: loading });
  };

  const collectionContext = {
    contract: CollectionState.contract,
    totalSupply: CollectionState.totalSupply,
    collection: CollectionState.collection,
    nftIsLoading: CollectionState.nftIsLoading,
    loadContract: loadContractHandler,
    loadTotalSupply: loadTotalSupplyHandler,
    loadCollection: loadCollectionHandler,
    updateCollection: updateCollectionHandler,
    updateOwner: updateOwnerHandler,
    setNftIsLoading: setNftIsLoadingHandler,
  };

  return (
    <CollectionContext.Provider value={collectionContext}>
      {props.children}
    </CollectionContext.Provider>
  );
};

export default CollectionProvider;

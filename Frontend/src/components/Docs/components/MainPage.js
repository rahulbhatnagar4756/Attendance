import React, { useState, useEffect } from "react";
import Details from "./Details";
import { DOCS } from "../../../constants/AppConstants";
import { toast } from "react-toastify";
import { httpClient } from "../../../constants/Api";
import * as $ from "jquery";
import _ from "lodash";
import FileExplorer from "./FileExplorer";
import { useSelector } from "react-redux";

export const MainPage = (props) => {
	const [loading, setLoading] = useState(false);
	const [folderTreeView, setFolderTreeView] = useState();
	const [selectedNodeData, setSelectedNodeData] = useState();
	const [allDirectories, setAllDirectories] = useState([]);

	const userId = useSelector((state) => state.user.user.user.id);
	const [breadcrumbArray, setBreadcrumArray] = useState([]);
	useEffect(() => {
		getAllDocuments();
		const selectTarget = (fromElement, selector) => {
			if (!(fromElement instanceof HTMLElement)) {
				return null;
			}
			return fromElement.querySelector(selector);
		};
		const resizeData = {
			tracking: false,
			startWidth: null,
			startCursorScreenX: null,
			handleWidth: 10,
			resizeTarget: null,
			parentElement: null,
			maxWidth: null,
		};
		$(document.body).on("mousedown", ".resize-handle--x", null, (event) => {
			if (event.button !== 0) {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			const handleElement = event.currentTarget;

			if (!handleElement.parentElement) {
				console.error(new Error("Parent element not found."));
				return;
			}
			const targetSelector = handleElement.getAttribute("data-target");
			const targetElement = selectTarget(
				handleElement.parentElement,
				targetSelector
			);
			if (!targetElement) {
				console.error(new Error("Resize target element not found."));
				return;
			}
			resizeData.startWidth = $(targetElement).outerWidth();
			resizeData.startCursorScreenX = event.screenX;
			resizeData.resizeTarget = targetElement;
			resizeData.parentElement = handleElement.parentElement;
			resizeData.maxWidth =
				$(handleElement.parentElement).innerWidth() - resizeData.handleWidth;
			resizeData.tracking = true;
		});

		$(window).on(
			"mousemove",
			null,
			null,
			_.debounce((event) => {
				if (resizeData.tracking) {
					const cursorScreenXDelta =
						event.screenX - resizeData.startCursorScreenX;
					const newWidth = Math.min(
						resizeData.startWidth + cursorScreenXDelta,
						resizeData.maxWidth
					);

					$(resizeData.resizeTarget).outerWidth(newWidth);
				}
			}, 1)
		);

		$(window).on("mouseup", null, null, (event) => {
			if (resizeData.tracking) {
				resizeData.tracking = false;
			}
		});
	}, []);

	const getAllDocuments = async () => {
		try {
			setLoading(true);
			const users = await httpClient.get(
				DOCS.GET_USERS_ALL_FOLDER.replace("{userId}", userId)
			);
			setFolderTreeView(users.data.result.getFomattedData);
			setSelectedNodeData(users.data.result.getFomattedData[0]);
			const flattanDirectories = await flattanTheArray([
				users.data.result.getFomattedData[0],
				users.data.result.getFomattedData[0].children,
			]);
			setAllDirectories(flattanDirectories);
			return users.data.result.getFomattedData;
		} catch (err) {
			if (err.response) toast.error(err.response.data.message);
			else toast.error("Error in fetching docs");
		} finally {
			setLoading(false);
		}
	};

	function flattanTheArray(array) {
		var result = [];
		array.forEach(function (a) {
			if (a.type === "Folder") {
				result.push(a);
				if (Array.isArray(a.children)) {
					result = result.concat(flattanTheArray(a.children));
				}
			}
		});
		return result;
	}

	// const recursiveSetState = (tree, indexes, currIndex, key, value) => {
	//   const dupTree = tree.slice();
	//   const getIndex = indexes[currIndex];
	//   if (currIndex === indexes.length - 1) {
	//     dupTree[getIndex][key] = value;
	//     return tree;
	//   }
	//   dupTree[getIndex].children = recursiveSetState((dupTree[getIndex].children || []).slice(0), indexes, currIndex + 1, key, value);
	//   return dupTree;
	// };

	const onSelectNode = async (nodeData) => {
		const response = await getBreadCrumbArray(nodeData, []);
		const formattedBreadcrumb = response.reverse();
		setBreadcrumArray(formattedBreadcrumb);
		setSelectedNodeData(nodeData);
	};

	const getBreadCrumbArray = async (selectedDir, bArray) => {
		let updatedBArray = [...bArray];
		updatedBArray.push(selectedDir);
		const findParent = allDirectories.find(
			// (dir) => dir._id === selectedDir.parentFolder || dir._id === selectedDir.parentFolderForUser
			(dir) => dir._id === selectedDir.parentFolder
		);
		if (findParent) {
			updatedBArray = await getBreadCrumbArray(findParent, updatedBArray);
		}
		return updatedBArray; // to reverse breadcrumb elements for proper order.
	};

	const refreshParent = async (folderId) => {
		const updatedTree = await getAllDocuments();
		updatedTree.forEach(async (node) => {
			await findAndUpdateSelectedNode(folderId, node);
		});
	};

	const findAndUpdateSelectedNode = (folderId, node) => {
		if (folderId == node._id) {
			setSelectedNodeData(node);
		} else if (node.children && node.children.length) {
			node.children.forEach(async (node) => {
				const findNode = await findAndUpdateSelectedNode(folderId, node);
				if (findNode) {
					setSelectedNodeData(findNode);
				}
			});
		}
	};

	const updateBreadCrumArrayForAddFileFolder = (breadcrumbArray, data, type) => {
		for(let breadCrumNode of breadcrumbArray){
			if(breadCrumNode._id===data.parentFolder && type==="ADD"){
				//if id already exist
				if(!breadCrumNode.children){
					breadCrumNode.children = [];
				}
				const idExist = breadCrumNode.children.find((currentElement)=>{
					if(currentElement._id===data._id){
						return  true
					}else{
						return false
					} 
				})
				if(!idExist){
				  // breadCrumNode.children.unshift(data);
				  breadCrumNode.children.push(data);
			  }
			}else if(breadCrumNode.children && breadCrumNode.children.length > 0){
				updateBreadCrumArrayForAddFileFolder(breadCrumNode.children, data, type);
			}
	  }
	}

	const updateBreadCrumArrayForDeleteDoc = (breadcrumbArray, data, type) => {
		for(let breadCrumNode of breadcrumbArray){
			if(breadCrumNode._id===data.parentFolder && type==="DELETE" ){
				const index = breadCrumNode.children.findIndex(currentChild => currentChild.name === data.name);
				if (index > -1) { // only splice array when item is found
					breadCrumNode.children.splice(index, 1); // 2nd parameter means remove one item only
				}else if(breadCrumNode.children && breadCrumNode.children.length > 0){
					updateBreadCrumArrayForDeleteDoc(breadCrumNode.children, data, type);
				}
			}else if(breadCrumNode.children && breadCrumNode.children.length > 0){
				updateBreadCrumArrayForDeleteDoc(breadCrumNode.children, data, type);
			}
	  }
	}

	const handleAddDeleteFolderOrFile = async (data, type) => {
		if(type==="ADD" && breadcrumbArray.length > 0){
			await updateBreadCrumArrayForAddFileFolder(breadcrumbArray, data, type);
		}else if(type==="DELETE" && breadcrumbArray.length > 0){
			updateBreadCrumArrayForDeleteDoc(breadcrumbArray, data, type);
		}else if(breadcrumbArray.length === 0){
				getAllDocuments();
		}
  }

	return (
		<>
			<div className="right-pannel">
				<div className="header_title_docs">
					<h1>
						<span>Document Vault</span>
					</h1>
				</div>
				<div className="main-section">
					{/* <aside className="sidebar">
            <div className="card grid-box">
              <div className="card-body">
                {folderTreeView &&
                  <DirectoriesTree allDirectoriesData={folderTreeView} onSelectNode={onSelectNode} callback={refreshParent} nodeData={selectedNodeData} />
                }
              </div>
            </div>
          </aside>
          <div className="resize-handle--x" data-target="aside"></div> */}
					<main className="app-content">
						<div className="row">
							<div
								className={
									selectedNodeData && selectedNodeData.permittedUsers.length > 0
										? "col-sm-9"
										: "col-sm-12"
								}
							>
								<div className="card grid-box">
									<div className="card-body p-0">
										<FileExplorer
											nodeData={selectedNodeData}
											onSelectNode={onSelectNode}
											callback={refreshParent}
											breadCrumbData={breadcrumbArray}
											callBackForAddDoc={handleAddDeleteFolderOrFile}
										/>
									</div>
								</div>
							</div>
							{selectedNodeData &&
								selectedNodeData.permittedUsers.length > 0 && (
									<div className="col-sm-3" style={{ paddingLeft: "0px" }}>
										<div className="card grid-box">
											<div className="card-body">
												<Details nodeData={selectedNodeData} />
											</div>
										</div>
									</div>
								)}
						</div>
					</main>
				</div>
			</div>
		</>
	);
};

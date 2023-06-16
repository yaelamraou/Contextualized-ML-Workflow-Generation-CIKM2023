

function getFMRootNode(document) {
    docRoot = document.getElementsByTagName("struct")[0];
    //On cherche dans ses fils
    for (let i = 0; i < docRoot.children.length; i++) {
        let child = docRoot.children[i];
        if (isFeatureNode(child)) {
            return child;
        }
    }
    return null;
}



function isFeatureNode(nodeHtml) {
    return ["feature", "and", "or", "alt"].includes(nodeHtml.tagName);
}


function traverseDocToVisuHtml(configuratorRenderer, node, featureName, old, isSubfeature, htmlToBuild) {
    if (isFeatureNode(node)) {
        if (isSubfeature) {
            let currentFeatureName = node.getAttribute("name");
            let feature =configuratorRenderer.model.getFeature(currentFeatureName);
            //MIX get UIANnotation to replace ""
            htmlToBuild += renderFeatureMethod( old, feature,configuratorRenderer.options.UIAnnotations); //Construire le html pour le noeud courant : fn(node, parent, level);
            let subHtmlToBuild="";
            if (node.children.length > 0) {
                for (let i = 0; i < node.children.length; i++) {
                    let child = node.children[i];
                    if (isFeatureNode(child)) {
                        subHtmlToBuild += "<ul class='content'>";
                        subHtmlToBuild += traverseDocToVisuHtml(configuratorRenderer, child, featureName, old, isSubfeature,"" );
                        subHtmlToBuild += "</ul>";
                    }
                }
            }
            return htmlToBuild + subHtmlToBuild;
        } else {// pas encore trouvé le noeud. mais il a une forme correcte
            if (node.getAttribute("name") === featureName) {
                isSubfeature = true;
                htmlToBuild += traverseDocToVisuHtml(configuratorRenderer, node, featureName, old, isSubfeature, htmlToBuild);
                return htmlToBuild;
            }
            //je cherche de suite sur un de mes fils
            if (node.children.length <= 0) {
                //je ne trouverai pas dans cette branche
                return htmlToBuild;
            }
            //On part en largeur
            for (let i = 0; i < node.children.length; i++) {
                let child = node.children[i];
                if (isFeatureNode(child)) {
                    if (child.getAttribute("name") === featureName) {
                        isSubfeature = true;
                        htmlToBuild += traverseDocToVisuHtml(configuratorRenderer, child, featureName, old, isSubfeature, htmlToBuild);
                        return htmlToBuild;
                    }
                }
                // else {//Child n'a pas le bon format
                //On considere dans ce cas que ce n'est pas la peine de descendre
            }
            // nous n'avons pas trouvé le noeud concerné au premier niveau
            // ... on part en profondeur
            for (let i = 0; i < node.children.length; i++) {
                let child = node.children[i];
                if (isFeatureNode(child)) {
                    htmlToBuild += traverseDocToVisuHtml(configuratorRenderer, child, featureName, old, isSubfeature, htmlToBuild);
                    if (isSubfeature)
                        return htmlToBuild;
                }
            }
            //on n'a pas trouvé
        }
    }
    //On n'a pas trouvé, on ne descend pas.
    return htmlToBuild;
}
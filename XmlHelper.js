const BASE_URL = "files/";

export default class XmlHelper {
  static getXmlDocDetails(xmlDoc) {
    const categories = Array.from(xmlDoc.querySelectorAll("codes"))
      .filter((node) => node.attributes[0].textContent === "bip:topics:1.0")
      .map((node) => Array.from(node.children))
      .flat()
      .map((node) => node.attributes[0].textContent);

    let title = xmlDoc.getElementsByTagName("title")[0].childNodes[0].data;

    let text = Array.from(
      xmlDoc.querySelectorAll("text p"),
      (item) => item.innerHTML
    ).join(" ");
    return { text, title, categories };
  }

  static requestXmlDoc(fileNameId) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", `${BASE_URL}/${fileNameId}NEWS.XML`, false);
    xmlHttp.send();
    let xmlDocText = xmlHttp.responseText;

    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xmlDocText, "text/xml");
    return xmlDoc;
  }
}
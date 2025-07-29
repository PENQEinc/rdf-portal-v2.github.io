#!/usr/bin/env node
/**
 * 全73データセットの完全なJSONファイルを生成し、知られているメタデータを統合する
 */

const fs = require('fs');
const path = require('path');

// temp-datasets.txtから全データセットIDを読み込み
function getAllDatasetIds() {
  const tempFile = path.join(__dirname, '../assets/data/temp-datasets.txt');
  const content = fs.readFileSync(tempFile, 'utf-8');
  return content.split('\n').filter(line => line.trim().length > 0);
}

// 既知のメタデータ（GitHub rdf-configリポジトリと手動調査による）
const knownMetadata = {
  "bgee": {
    "title": "Bgee",
    "description": "A database for retrieval and comparison of gene expression patterns across multiple animal species",
    "tags": ["Gene", "Gene expression"]
  },
  "biosample": {
    "title": "BioSample RDF",
    "description": "BioSample RDF developed by DBCLS and distributed by DDBJ",
    "tags": ["Sample", "Metadata"]
  },
  "bmrb": {
    "title": "BMRB/RDF",
    "description": "BMRB/RDF is a translation of NMR-STAR data into RDF",
    "tags": ["NMR", "Structure"]
  },
  "chebi": {
    "title": "ChEBI RDF",
    "description": "ChEBI (Chemical Entities of Biological Interest) is a freely accessible, ontology-driven database of small molecular entities",
    "tags": ["Chemical", "Ontology"]
  },
  "chembl": {
    "title": "ChEMBL RDF",
    "description": "ChEMBL is a manually curated database of bioactive molecules with drug-like properties",
    "tags": ["Drug", "Bioactivity"]
  },
  "clinvar": {
    "title": "ClinVar RDF",
    "description": "ClinVar aggregates information about genomic variation and its relationship to human health",
    "tags": ["Genetic variation", "Clinical"]
  },
  "dbcatalog": {
    "title": "Integbio Database Catalog/RDF",
    "description": "A comprehensive catalog of biological databases maintained by the DBCLS",
    "tags": ["Database", "Catalog"]
  },
  "dbnsfp": {
    "title": "dbNSFP",
    "description": "Database for functional predictions and annotations for all potential non-synonymous single-nucleotide variants",
    "tags": ["SNV", "Functional prediction"]
  },
  "dbscsnv": {
    "title": "dbscSNV",
    "description": "Database of splicing consensus single nucleotide variants",
    "tags": ["SNV", "Splicing"]
  },
  "ddbj": {
    "title": "DDBJ",
    "description": "DNA Data Bank of Japan",
    "tags": ["DNA", "Sequence"]
  },
  "disgenet": {
    "title": "DisGeNET RDF",
    "description": "DisGeNET is a discovery platform containing collections of genes and variants associated to human diseases",
    "tags": ["Disease", "Gene", "Variant"]
  },
  "ensembl": {
    "title": "Ensembl RDF",
    "description": "Ensembl genome annotation project",
    "tags": ["Genome", "Annotation"]
  },
  "famsbase": {
    "title": "FAMSBASE GPCR",
    "description": "FAMSBASE is a relational database of G-protein coupled receptor mutants",
    "tags": ["GPCR", "Mutant"]
  },
  "ggdonto": {
    "title": "GGDonto",
    "description": "GGDonto is the Ontology of the Genetic Diseases related to the Glycan Metabolism",
    "tags": ["Glycan", "Disease", "Ontology"]
  },
  "glycoepitope": {
    "title": "GlycoEpitope",
    "description": "GlycoEpitope is a database of useful information on carbohydrate antigens and antibodies",
    "tags": ["Glycan", "Epitope", "Antibody"]
  },
  "glycosmos": {
    "title": "GlyCosmos",
    "description": "GlyCosmos is a web portal for glycoscience provided by RIKEN",
    "tags": ["Glycan", "Portal"]
  },
  "glytoucan": {
    "title": "GlyTouCan",
    "description": "GlyTouCan is the international glycan structure repository",
    "tags": ["Glycan", "Structure"]
  },
  "gtdb": {
    "title": "GTDB",
    "description": "Genome Taxonomy Database",
    "tags": ["Genome", "Taxonomy"]
  },
  "hgnc": {
    "title": "HGNC: The resource for approved human gene nomenclature",
    "description": "The HGNC is responsible for approving unique symbols and names for human loci",
    "tags": ["Gene", "Nomenclature", "Human"]
  },
  "homologene": {
    "title": "HomoloGene RDF",
    "description": "HomoloGene is a system for automated detection of homologs among annotated genes",
    "tags": ["Gene", "Homology"]
  },
  "jcm": {
    "title": "Metadata of JCM resources",
    "description": "Japan Collection of Microorganisms metadata",
    "tags": ["Microorganism", "Collection"]
  },
  "jpostdb": {
    "title": "jPOST database RDF",
    "description": "Japan ProteOme STandard database",
    "tags": ["Proteome", "Standard"]
  },
  "kero": {
    "title": "DBKERO RDF",
    "description": "Database of KEgg pathways Represented as rdf/Owl",
    "tags": ["Pathway", "KEGG"]
  },
  "knapsack": {
    "title": "KNApSAcK RDF",
    "description": "KNApSAcK provides information on plant metabolites",
    "tags": ["Plant", "Metabolite"]
  },
  "mbgd": {
    "title": "MBGD",
    "description": "Microbial Genome Database for comparative analysis",
    "tags": ["Microbial", "Genome", "Comparative"]
  },
  "medgen": {
    "title": "MedGen",
    "description": "Medical Genetics database at NCBI",
    "tags": ["Medical", "Genetics"]
  },
  "mesh": {
    "title": "Medical Subject Headings (MeSH) RDF",
    "description": "MeSH is the NLM controlled vocabulary thesaurus",
    "tags": ["Medical", "Vocabulary", "Thesaurus"]
  },
  "nadd": {
    "title": "Nucleic Acid Drug Database",
    "description": "Database of nucleic acid drugs",
    "tags": ["Nucleic acid", "Drug"]
  },
  "nando": {
    "title": "NANDO",
    "description": "Nanobyo Data Ontology for intractable and rare diseases",
    "tags": ["Disease", "Rare", "Ontology"]
  },
  "naro_genebank": {
    "title": "Dataset of NARO Genebank Microorganism Bioresource",
    "description": "National Agriculture and Food Research Organization Genebank microorganism collection",
    "tags": ["Microorganism", "Agriculture"]
  },
  "nbrc": {
    "title": "Dataset of NBRC bioresource",
    "description": "NITE Biological Resource Center collection",
    "tags": ["Bioresource", "Collection"]
  },
  "ncbigene": {
    "title": "NCBI Gene RDF",
    "description": "NCBI Gene database in RDF format",
    "tags": ["Gene", "NCBI"]
  },
  "nikkaji": {
    "title": "Nikkaji RDF",
    "description": "Japan Chemical Substance Dictionary",
    "tags": ["Chemical", "Dictionary", "Japan"]
  },
  "pdb": {
    "title": "Protein Data Bank",
    "description": "Worldwide repository for the processing and distribution of 3D structure data",
    "tags": ["Protein", "Structure", "3D"]
  },
  "pubmed": {
    "title": "PubMed",
    "description": "PubMed comprises more than 30 million citations for biomedical literature",
    "tags": ["Literature", "Biomedical", "Citation"]
  },
  "reactome": {
    "title": "Reactome",
    "description": "Reactome is a free, open-source, curated and peer-reviewed pathway database",
    "tags": ["Pathway", "Curated"]
  },
  "uniprot": {
    "title": "UniProt",
    "description": "UniProt is a comprehensive resource for protein sequence and annotation data",
    "tags": ["Protein", "Sequence", "Annotation"]
  },
  "wikidata": {
    "title": "Wikidata",
    "description": "Wikidata is a free and open knowledge base",
    "tags": ["Knowledge base", "Open data"]
  }
};

/**
 * メイン処理
 */
function main() {
  try {
    console.log('🚀 Generating comprehensive temp-datasets.json...');
    
    // 全データセットIDを取得
    const allDatasetIds = getAllDatasetIds();
    console.log(`📋 Found ${allDatasetIds.length} total datasets`);
    
    // 各データセットのエントリを生成
    const datasets = allDatasetIds.map(id => {
      const metadata = knownMetadata[id];
      
      if (metadata) {
        console.log(`✅ ${id}: ${metadata.title}`);
        return {
          id: id,
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags
        };
      } else {
        console.log(`⭕ ${id}: No metadata available`);
        return {
          id: id,
          title: "",
          description: "",
          tags: []
        };
      }
    });
    
    // JSONファイルとして保存
    const outputFile = path.join(__dirname, '../assets/data/temp-datasets.json');
    fs.writeFileSync(outputFile, JSON.stringify(datasets, null, 2), 'utf-8');
    
    console.log(`\n🎉 Generated comprehensive ${outputFile}`);
    console.log(`📊 Total datasets: ${datasets.length}`);
    
    // 統計情報
    const withMetadata = datasets.filter(d => d.title).length;
    const withoutMetadata = datasets.length - withMetadata;
    
    console.log(`📈 With metadata: ${withMetadata}`);
    console.log(`📉 Without metadata: ${withoutMetadata}`);
    console.log(`📊 Coverage: ${Math.round(withMetadata / datasets.length * 100)}%`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}

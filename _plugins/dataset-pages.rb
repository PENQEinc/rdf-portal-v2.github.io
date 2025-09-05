# _data/datasets.json からdatasets を使い、それぞれの静的なページを作成する
module Jekyll
  class DatasetPage < PageWithoutAFile
    def initialize(site, base, dir, dataset)
      @site = site
      @base = base
      @dir  = dir
      @name = 'index.html'

      process(@name)
      read_yaml(File.join(base, '_layouts'), 'dataset.html')

      data['layout']   = 'dataset'
      data['title']    = 'Dataset Details'
      data['dataset']  = dataset
      data['permalink'] = "/dataset/#{dataset['id']}/"
      # Note: Jekyll automatically prepends baseurl to permalinks
      # so we don't need to modify this format (e.g., don't use #{site.config['baseurl']}/dataset/...)
      # The final URL will be: [baseurl]/dataset/[dataset-id]/

    end
  end

  class DatasetsGenerator < Generator
    safe true
    priority :normal

    def generate(site)
      datasets = site.data['datasets'] || []
      # Hash で来た場合にも対応
      datasets = datasets.values if datasets.is_a?(Hash)

      datasets.each do |ds|
        id   = ds['id'].to_s
        slug = (ds['slug'] || id).to_s

        site.pages << DatasetPage.new(
          site,
          site.source,
          File.join('dataset', slug),
          ds.merge('id' => id, 'slug' => slug)
        )
      end
    end
  end
end

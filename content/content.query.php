<?php

require_once(TOOLKIT . '/class.jsonpage.php');

Class contentExtensionAssociation_ui_selectorQuery extends JSONPage
{

    public function view()
    {
        $database = Symphony::Configuration()->get('db', 'database');
        $field_ids = explode(',', General::sanitize($_GET['field_id']));
        $search = General::sanitize($_GET['query']);
        $limit = intval(General::sanitize($_GET['limit']));
        $filters = $_GET['filter'];

        // Set limit
        if ($limit === 0) {
            $max = '';
        } elseif (empty($limit)) {
            $max = ' LIMIT 100';
        } else {
            $max = ' LIMIT ' . $limit;
        }

        foreach($field_ids as $field_id) {
            $this->get($database, intval($field_id), $search, $max, $filters);
        }

        // Return results
        return $this->_Result;
    }

    private function get($database, $field_id, $search, $max, $filters)
    {

        if (!empty($filters)) {
            // Build Filters
            $field = FieldManager::fetch($field_id);
            $section_id = $field->get('parent_section');

            $whereFilters = '';
            $joins = ' JOIN tbl_entries AS e ON (e.id = ed.entry_id)';

            foreach ($filters as $handle => $value) {
                if (!is_array($value)) {
                    $filter_type = Datasource::determineFilterType($value);
                    $value = preg_split('/'.($filter_type == Datasource::FILTER_AND ? '\+' : '(?<!\\\\),').'\s*/', $value, -1, PREG_SPLIT_NO_EMPTY);
                    $value = array_map('trim', $value);
                    $value = array_map(array('Datasource', 'removeEscapedCommas'), $value);
                }

                $handle = Symphony::Database()->cleanValue($handle);
                $filter_id = FieldManager::fetchFieldIDFromElementName($handle,$section_id);

                $field = FieldManager::fetch($filter_id);
                if ($field instanceof Field) {
                    $field->buildDSRetrievalSQL($value, $joins, $whereFilters, ($filter_type == Datasource::FILTER_AND ? true : false));
                }
            }
        } else{
            $whereFilters = '';
            $joins = '';
        }

        // Get entries
        if (!empty($search)) {

            // Get columns
            $columns = Symphony::Database()->fetchCol('column_name',
                sprintf(
                    "SELECT column_name
                    FROM information_schema.columns
                    WHERE table_schema = '%s'
                    AND table_name = 'tbl_entries_data_%d'
                    AND column_name != 'id'
                    AND column_name != 'entry_id';",
                    $database,
                    $field_id
                )
            );

            // Build where clauses
            $where = array();
            foreach ($columns as $column) {
                $where[] = "ed.`$column` LIKE '%$search%'";
            }

            // Build query
            $query = sprintf(
                "SELECT ed.* from tbl_entries_data_%d AS ed %s WHERE (%s) %s %s;",
                $field_id,
                $joins,
                implode($where, " OR "),
                $whereFilters,
                $max
            );
            
        } else {
            $query = sprintf(
                "SELECT ed.* from tbl_entries_data_%d AS ed %s WHERE 1 %s %s;",
                $field_id,
                $joins,
                $whereFilters,
                $max
            );
        }

        // Fetch field values
        $data = Symphony::Database()->fetch($query);

        if (!empty($data)) {
            $field = FieldManager::fetch($field_id);
            $parent_section = SectionManager::fetch($field->get('parent_section'));
            $parent_section_handle = $parent_section->get('handle');

            foreach ($data as $field_data) {
                $entry_id = $field_data['entry_id'];

                if ($field instanceof ExportableField && in_array(ExportableField::UNFORMATTED, $field->getExportModes())) {

                    // Get unformatted value
                    $value = $field->prepareExportValue($field_data, ExportableField::UNFORMATTED, $entry_id);
                } elseif ($field instanceof ExportableField && in_array(ExportableField::VALUE, $field->getExportModes())) {

                    // Get formatted value
                    $value = $field->prepareExportValue($field_data, ExportableField::VALUE, $entry_id);
                } else {

                    // Get value from parameter pool
                    $value = $field->getParameterPoolValue($field_data, $entry_id);
                }

                $this->_Result['entries'][$entry_id]['value'] = $value;
                $this->_Result['entries'][$entry_id]['section'] = $parent_section_handle;
                $this->_Result['entries'][$entry_id]['link'] = APPLICATION_URL . '/publish/' . $parent_section_handle . '/edit/' . $entry_id . '/';
            }
        }
    }

}

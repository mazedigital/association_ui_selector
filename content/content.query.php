<?php

require_once(TOOLKIT . '/class.jsonpage.php');

Class contentExtensionAssociation_ui_selectorQuery extends JSONPage
{

    public function view()
    {
        $database = Symphony::Configuration()->get('db', 'database');
        $field_ids = explode('|', General::sanitize($_GET['field_id']));
        $search = Symphony::Database()->cleanValue(General::sanitize($_GET['query']));
        $entry_id = Symphony::Database()->cleanValue(General::sanitize($_GET['entry_id']));
        $limit = intval(General::sanitize($_GET['limit']));
        $filters = $_GET['filter'];
        $searchById = false;

        if (empty($search) && is_numeric($entry_id)){
            $search = $entry_id;
            $searchById = true;
        }

        // Set limit
        if ($limit === 0) {
            $max = '';
        } elseif (empty($limit)) {
            $max = ' LIMIT 100';
        } else {
            $max = ' LIMIT ' . $limit;
        }

        foreach($field_ids as $field_id) {
            $this->get($database, intval($field_id), $search, $max, $filters, $searchById);
        }

        // Return results
        return $this->_Result;
    }

    private function get($database, $field_id, $search, $max, $filters, $searchById = false)
    {
        // Build Filters
        $field = FieldManager::fetch($field_id);
        $section_id = $field->get('parent_section');

        $whereFilters = '';
        $joins = ' JOIN `tbl_entries` AS `e` ON (`e`.`id` = `ed`.`entry_id`)';

        if (!empty($filters)) {

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
        }

        /**
         * Allow the results to be modified using adjust publish filtering functionality on the core
         *
         * @delegate AssociationFiltering
         * @since Symphony 1.2.0
         * @param string $context
         * '/publish/'
         * @param array $options
         *  An array which should contain the section id
         *  and the joins and where clauses by reference both passed by reference
         *  also contains a field-id of the current field being rendered
         *  Filters are not obtained via callback in this instance
         */
        Symphony::ExtensionManager()->notifyMembers('AssociationFiltering', '/publish/', array(
            'section-id' => $section_id,
            'field-id' => $field_id,
            'joins' => &$joins,
            'where' => &$whereFilters
            // 'filters' => &$filters,
        ));

        // Get entries
        if (!empty($search) && $searchById) {
            $query = sprintf(
                "SELECT `ed`.* from `tbl_entries_data_%d` AS `ed` %s WHERE `e`.`id` = '$search' %s %s;",
                $field_id,
                $joins,
                $whereFilters,
                $max
            );
        } else if (!empty($search)) {
            $handle = General::createHandle(urldecode($search));

            // Get columns
            $columns = Symphony::Database()->fetchCol('column_name',
                sprintf(
                    "SELECT `column_name`
                    FROM `information_schema`.`columns`
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
                //if column contains handle do a handle search - increases possibility of a match
                if (strpos($column, "handle") !== false){
                    $where[] = "`ed`.`$column` LIKE '%$handle%'";
                } else {
                    $where[] = "`ed`.`$column` LIKE '%$search%'";
                }
            }

            // Build query
            $query = sprintf(
                "SELECT `ed`.* from `tbl_entries_data_%d` AS `ed` %s WHERE (%s) %s %s;",
                $field_id,
                $joins,
                implode($where, " OR "),
                $whereFilters,
                $max
            );
            
        } else {
            $query = sprintf(
                "SELECT `ed`.* from `tbl_entries_data_%d` AS `ed` %s WHERE 1 %s %s;",
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
